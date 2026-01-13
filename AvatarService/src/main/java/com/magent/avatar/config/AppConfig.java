package com.magent.avatar.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {

    private String uploadDir = "uploads";
    private String avatarModelsDir = "avatar-models";
    private long maxFileSize = 50 * 1024 * 1024; // 50MB
    private String[] allowedFileTypes = {".png", ".jpg", ".jpeg", ".moc3", ".json", ".physics3.json"};

    // Getters and setters
    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public String getAvatarModelsDir() {
        return avatarModelsDir;
    }

    public void setAvatarModelsDir(String avatarModelsDir) {
        this.avatarModelsDir = avatarModelsDir;
    }

    public long getMaxFileSize() {
        return maxFileSize;
    }

    public void setMaxFileSize(long maxFileSize) {
        this.maxFileSize = maxFileSize;
    }

    public String[] getAllowedFileTypes() {
        return allowedFileTypes;
    }

    public void setAllowedFileTypes(String[] allowedFileTypes) {
        this.allowedFileTypes = allowedFileTypes;
    }
}