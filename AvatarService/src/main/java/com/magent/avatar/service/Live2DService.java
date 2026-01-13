package com.magent.avatar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class Live2DService {

    @Value("${app.live2d.storage.path:./live2d-models}")
    private String storagePath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> validateAndExtractModelInfo(MultipartFile modelFile) throws IOException {
        Map<String, Object> modelInfo = new HashMap<>();

        // Check if it's a zip file containing Live2D model
        String filename = modelFile.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".zip")) {
            throw new IllegalArgumentException("Model file must be a ZIP archive");
        }

        // For now, return basic info - in production you'd extract and validate the model
        modelInfo.put("modelName", filename.replace(".zip", ""));
        modelInfo.put("fileSize", modelFile.getSize());
        modelInfo.put("contentType", modelFile.getContentType());

        return modelInfo;
    }

    public String saveModelFiles(MultipartFile modelFile, String avatarId) throws IOException {
        String modelDirectory = storagePath + "/avatar-" + avatarId;
        Path modelPath = Paths.get(modelDirectory);

        if (!Files.exists(modelPath)) {
            Files.createDirectories(modelPath);
        }

        // Save the uploaded file
        String filename = "model.zip";
        Path filePath = modelPath.resolve(filename);
        Files.copy(modelFile.getInputStream(), filePath);

        return modelDirectory;
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