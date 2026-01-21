package com.magent.avatar.controller;

import com.magent.avatar.model.Avatar;
import com.magent.avatar.service.AvatarService;
import com.magent.avatar.service.Live2DService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/avatar")
@Tag(name = "Avatar Service", description = "Live2D avatar management and operations")
public class AvatarController {

    @Autowired
    private AvatarService avatarService;

    @Autowired
    private Live2DService live2DService;

    @GetMapping("/models")
    @Operation(summary = "Get all public avatars", description = "Retrieve a list of all publicly available Live2D avatars")
    public ResponseEntity<List<Avatar>> getAllAvatars() {
        List<Avatar> avatars = avatarService.getAllPublicAvatars();
        return ResponseEntity.ok(avatars);
    }

    @GetMapping("/models/category/{category}")
    @Operation(summary = "Get avatars by category", description = "Retrieve avatars filtered by category (character, animal, fantasy, etc.)")
    public ResponseEntity<List<Avatar>> getAvatarsByCategory(@Parameter(description = "Avatar category") @PathVariable String category) {
        List<Avatar> avatars = avatarService.getAvatarsByCategory(category);
        return ResponseEntity.ok(avatars);
    }

    @GetMapping("/models/search")
    @Operation(summary = "Search avatars", description = "Search for avatars by name or description")
    public ResponseEntity<List<Avatar>> searchAvatars(@Parameter(description = "Search term") @RequestParam String q) {
        List<Avatar> avatars = avatarService.searchAvatars(q);
        return ResponseEntity.ok(avatars);
    }

    @GetMapping("/models/tag/{tag}")
    @Operation(summary = "Get avatars by tag", description = "Retrieve avatars that have a specific tag")
    public ResponseEntity<List<Avatar>> getAvatarsByTag(@Parameter(description = "Tag name") @PathVariable String tag) {
        List<Avatar> avatars = avatarService.getAvatarsByTag(tag);
        return ResponseEntity.ok(avatars);
    }

    @GetMapping("/models/{id}")
    @Operation(summary = "Get avatar by ID", description = "Retrieve detailed information about a specific avatar")
    public ResponseEntity<Avatar> getAvatarById(@Parameter(description = "Avatar ID") @PathVariable Long id) {
        Optional<Avatar> avatar = avatarService.getAvatarById(id);
        return avatar.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/models")
    @Operation(summary = "Create new avatar", description = "Upload and create a new Live2D avatar")
    public ResponseEntity<?> createAvatar(
            @Parameter(description = "Avatar name") @RequestParam String name,
            @Parameter(description = "Avatar description") @RequestParam String description,
            @Parameter(description = "Avatar category") @RequestParam String category,
            @Parameter(description = "Live2D model file (ZIP)") @RequestParam MultipartFile modelFile,
            @Parameter(description = "Thumbnail image") @RequestParam MultipartFile thumbnail,
            @Parameter(description = "Comma-separated tags") @RequestParam(required = false) String tags,
            @RequestHeader("X-User") String userId) {

        try {
            // Validate input parameters
            validateAvatarInput(name, description, category, modelFile, thumbnail);

            // Validate model file and extract info
            Map<String, Object> modelInfo = live2DService.validateAndExtractModelInfo(modelFile);

            // Validate thumbnail image
            validateThumbnailImage(thumbnail);

            // Create avatar entity
            Avatar avatar = new Avatar();
            avatar.setName(name.trim());
            avatar.setDescription(description.trim());
            avatar.setCategory(category.toLowerCase());
            avatar.setCreatedBy(userId);
            avatar.setPublic(true);

            if (tags != null && !tags.trim().isEmpty()) {
                List<String> tagList = Arrays.stream(tags.split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .collect(java.util.stream.Collectors.toList());
                avatar.setTags(tagList);
            }

            // Save avatar first to get ID
            Avatar savedAvatar = avatarService.createAvatar(avatar);

            // Save model files
            String modelPath = live2DService.saveModelFiles(modelFile, savedAvatar.getId().toString());
            savedAvatar.setModelPath(modelPath);

            // Save thumbnail image
            String thumbnailPath = saveThumbnailImage(thumbnail, savedAvatar.getId().toString());
            savedAvatar.setThumbnailPath(thumbnailPath);

            // Save final avatar
            Avatar finalAvatar = avatarService.updateAvatar(savedAvatar.getId(), savedAvatar);

            Map<String, Object> response = new HashMap<>();
            response.put("id", finalAvatar.getId());
            response.put("name", finalAvatar.getName());
            response.put("description", finalAvatar.getDescription());
            response.put("category", finalAvatar.getCategory());
            response.put("modelPath", finalAvatar.getModelPath());
            response.put("thumbnailPath", finalAvatar.getThumbnailPath());
            response.put("tags", finalAvatar.getTags());
            response.put("createdAt", finalAvatar.getCreatedAt());
            response.put("message", "Avatar uploaded successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getClass().getSimpleName());
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private void validateAvatarInput(String name, String description, String category, 
                                     MultipartFile modelFile, MultipartFile thumbnail) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Avatar name is required");
        }
        if (name.length() > 255) {
            throw new IllegalArgumentException("Avatar name must be less than 255 characters");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Avatar description is required");
        }
        if (description.length() > 1000) {
            throw new IllegalArgumentException("Avatar description must be less than 1000 characters");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Avatar category is required");
        }
        if (modelFile == null || modelFile.isEmpty()) {
            throw new IllegalArgumentException("Model file is required");
        }
        if (thumbnail == null || thumbnail.isEmpty()) {
            throw new IllegalArgumentException("Thumbnail image is required");
        }
    }

    private void validateThumbnailImage(MultipartFile thumbnail) {
        String contentType = thumbnail.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && 
            !contentType.equals("image/png") && !contentType.equals("image/gif"))) {
            throw new IllegalArgumentException("Thumbnail must be a valid image (JPG, PNG, GIF)");
        }
        if (thumbnail.getSize() > 5 * 1024 * 1024) { // 5MB limit
            throw new IllegalArgumentException("Thumbnail image must be less than 5MB");
        }
    }

    private String saveThumbnailImage(MultipartFile thumbnail, String avatarId) throws java.io.IOException {
        // Implementation for saving thumbnail - store in uploads directory
        java.nio.file.Path uploadPath = java.nio.file.Paths.get("./uploads/thumbnails");
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }
        
        String filename = "avatar-" + avatarId + "-" + System.currentTimeMillis() + ".png";
        java.nio.file.Path filePath = uploadPath.resolve(filename);
        java.nio.file.Files.copy(thumbnail.getInputStream(), filePath);
        
        return "/uploads/thumbnails/" + filename;
    }

    @PutMapping("/models/{id}")
    @Operation(summary = "Update avatar", description = "Update avatar information and metadata")
    public ResponseEntity<?> updateAvatar(@Parameter(description = "Avatar ID") @PathVariable Long id,
                                         @RequestBody Avatar avatarDetails,
                                         @RequestHeader("X-User") String userId) {
        try {
            Avatar updatedAvatar = avatarService.updateAvatar(id, avatarDetails);
            return ResponseEntity.ok(updatedAvatar);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/models/{id}")
    @Operation(summary = "Delete avatar", description = "Delete an avatar and its associated files")
    public ResponseEntity<?> deleteAvatar(@Parameter(description = "Avatar ID") @PathVariable Long id,
                                         @RequestHeader("X-User") String userId) {
        try {
            // Get avatar to find model path
            Optional<Avatar> avatar = avatarService.getAvatarById(id);
            if (avatar.isPresent()) {
                // Delete model files
                live2DService.deleteModelFiles(avatar.get().getModelPath());
            }

            avatarService.deleteAvatar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/models/{id}/config")
    @Operation(summary = "Get Live2D config", description = "Get Live2D configuration for an avatar")
    public ResponseEntity<Map<String, Object>> getLive2DConfig(@Parameter(description = "Avatar ID") @PathVariable Long id) {
        Optional<Avatar> avatar = avatarService.getAvatarById(id);
        if (avatar.isPresent()) {
            Map<String, Object> config = live2DService.generateLive2DConfig(avatar.get().getModelPath(), avatar.get().getName());
            return ResponseEntity.ok(config);
        }
        return ResponseEntity.notFound().build();
    }
}