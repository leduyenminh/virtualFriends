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
            // Validate model file
            Map<String, Object> modelInfo = live2DService.validateAndExtractModelInfo(modelFile);

            // Create avatar entity
            Avatar avatar = new Avatar();
            avatar.setName(name);
            avatar.setDescription(description);
            avatar.setCategory(category);
            avatar.setCreatedBy(userId);
            avatar.setModelPath("/models/avatar-" + avatar.getId()); // Will be updated after save
            avatar.setThumbnailPath("/thumbnails/avatar-" + avatar.getId() + ".png");

            if (tags != null && !tags.trim().isEmpty()) {
                avatar.setTags(List.of(tags.split(",")));
            }

            // Save avatar first to get ID
            Avatar savedAvatar = avatarService.createAvatar(avatar);

            // Update paths with actual ID
            savedAvatar.setModelPath("/models/avatar-" + savedAvatar.getId());
            savedAvatar.setThumbnailPath("/thumbnails/avatar-" + savedAvatar.getId() + ".png");

            // Save model files
            String modelPath = live2DService.saveModelFiles(modelFile, savedAvatar.getId().toString());
            savedAvatar.setModelPath(modelPath);

            // Save final avatar
            Avatar finalAvatar = avatarService.updateAvatar(savedAvatar.getId(), savedAvatar);

            return ResponseEntity.status(HttpStatus.CREATED).body(finalAvatar);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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