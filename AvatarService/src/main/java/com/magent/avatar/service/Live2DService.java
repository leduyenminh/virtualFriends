package com.magent.avatar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.magent.avatar.exception.FileStorageException;
import com.magent.avatar.exception.InvalidModelException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class Live2DService {

    @Value("${app.live2d.storage.path:./live2d-models}")
    private String storagePath;

    @Value("${app.upload.max-size:52428800}") // 50MB default
    private long maxFileSize;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        ".moc3", ".moc", ".json", ".png", ".jpg", ".jpeg", ".physics3.json"
    );

    public Map<String, Object> validateAndExtractModelInfo(MultipartFile modelFile) throws IOException {
        Map<String, Object> modelInfo = new HashMap<>();

        // Validate filename
        String filename = modelFile.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new InvalidModelException("File name cannot be empty");
        }

        // Validate file type
        if (!filename.toLowerCase().endsWith(".zip")) {
            throw new InvalidModelException("Model file must be a ZIP archive (.zip)");
        }

        // Validate file size
        long fileSize = modelFile.getSize();
        if (fileSize == 0) {
            throw new InvalidModelException("File is empty");
        }

        if (fileSize > maxFileSize) {
            throw new InvalidModelException(
                String.format("File size (%d MB) exceeds maximum allowed size (%d MB)",
                    fileSize / 1024 / 1024, maxFileSize / 1024 / 1024)
            );
        }

        // Validate ZIP contents
        List<String> zipContents = validateZipContents(modelFile);
        if (zipContents.isEmpty()) {
            throw new InvalidModelException("ZIP file is empty or corrupted");
        }

        // Check for required files (.moc3 or .moc)
        boolean hasMocFile = zipContents.stream()
            .anyMatch(f -> f.endsWith(".moc3") || f.endsWith(".moc"));
        if (!hasMocFile) {
            throw new InvalidModelException("ZIP file must contain a Live2D model file (.moc3 or .moc)");
        }

        modelInfo.put("modelName", filename.replace(".zip", ""));
        modelInfo.put("fileSize", fileSize);
        modelInfo.put("contentType", modelFile.getContentType());
        modelInfo.put("zipContents", zipContents);
        modelInfo.put("hasMocFile", true);

        return modelInfo;
    }

    private List<String> validateZipContents(MultipartFile zipFile) throws IOException {
        List<String> contents = new ArrayList<>();

        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String entryName = entry.getName().toLowerCase();
                    
                    // Validate file extension
                    boolean isAllowed = ALLOWED_EXTENSIONS.stream()
                        .anyMatch(entryName::endsWith);
                    
                    if (!isAllowed) {
                        throw new InvalidModelException(
                            String.format("Invalid file type in ZIP: %s. Allowed types: %s",
                                entryName, ALLOWED_EXTENSIONS)
                        );
                    }
                    
                    contents.add(entry.getName());
                }
            }
        } catch (IOException e) {
            throw new InvalidModelException("Failed to read ZIP file: " + e.getMessage(), e);
        }

        return contents;
    }

    public String saveModelFiles(MultipartFile modelFile, String avatarId) throws IOException {
        try {
            String modelDirectory = storagePath + "/avatar-" + avatarId;
            Path modelPath = Paths.get(modelDirectory);

            // Create directory
            if (!Files.exists(modelPath)) {
                Files.createDirectories(modelPath);
            }

            // Extract ZIP file
            try (ZipInputStream zis = new ZipInputStream(modelFile.getInputStream())) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (!entry.isDirectory()) {
                        Path entryPath = modelPath.resolve(entry.getName());
                        
                        // Create parent directories if needed
                        Files.createDirectories(entryPath.getParent());
                        
                        // Write file
                        Files.copy(zis, entryPath);
                    }
                }
            }

            return modelDirectory;
        } catch (IOException e) {
            throw new FileStorageException("Failed to save model files: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> getModelConfig(String modelPath) {
        Map<String, Object> config = new HashMap<>();

        try {
            Path modelJsonPath = Paths.get(modelPath, "model.json");
            if (Files.exists(modelJsonPath)) {
                String modelJson = Files.readString(modelJsonPath);
                JsonNode modelNode = objectMapper.readTree(modelJson);

                config.put("version", modelNode.get("version").asText());
                config.put("model", modelNode.get("model").asText());
                config.put("textures", modelNode.get("textures"));
                config.put("motions", modelNode.get("motions"));
                config.put("expressions", modelNode.get("expressions"));
            }
        } catch (Exception e) {
            // Return default config if model.json not found or invalid
            config.put("version", "2.0");
            config.put("model", "model.moc");
            config.put("textures", new String[]{"texture_00.png"});
        }

        return config;
    }

    public Map<String, Object> generateLive2DConfig(String modelPath, String avatarName) {
        Map<String, Object> live2dConfig = new HashMap<>();

        // Base configuration for Live2D Cubism Web SDK
        live2dConfig.put("name", avatarName);
        live2dConfig.put("model", "/api/avatar/models/" + modelPath + "/model.json");
        live2dConfig.put("textures", new String[]{
            "/api/avatar/models/" + modelPath + "/texture_00.png"
        });

        // Motion configurations
        Map<String, Object> motions = new HashMap<>();
        motions.put("idle", new String[]{"motions/idle/motion_00.motion3.json"});
        motions.put("talk", new String[]{"motions/talk/motion_00.motion3.json"});
        motions.put("happy", new String[]{"motions/happy/motion_00.motion3.json"});
        motions.put("sad", new String[]{"motions/sad/motion_00.motion3.json"});
        live2dConfig.put("motions", motions);

        // Expression configurations
        Map<String, Object> expressions = new HashMap<>();
        expressions.put("neutral", "expressions/expression_00.exp3.json");
        expressions.put("happy", "expressions/expression_01.exp3.json");
        expressions.put("sad", "expressions/expression_02.exp3.json");
        expressions.put("angry", "expressions/expression_03.exp3.json");
        live2dConfig.put("expressions", expressions);

        // Physics configuration
        live2dConfig.put("physics", "/api/avatar/models/" + modelPath + "/physics.json");

        // Pose configuration
        live2dConfig.put("pose", "/api/avatar/models/" + modelPath + "/pose.json");

        return live2dConfig;
    }

    public void deleteModelFiles(String modelPath) throws IOException {
        Path path = Paths.get(modelPath);
        if (Files.exists(path)) {
            Files.walk(path)
                 .sorted((a, b) -> b.compareTo(a)) // Reverse order for deletion
                 .forEach(p -> {
                     try {
                         Files.delete(p);
                     } catch (IOException e) {
                         // Log error but continue
                         System.err.println("Failed to delete: " + p);
                     }
                 });
        }
    }
}