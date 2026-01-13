package com.magent.avatar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class StorageConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.avatar.models.dir:avatar-models}")
    private String avatarModelsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded avatar files
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:" + uploadDir + "/");

        // Serve avatar model files
        registry.addResourceHandler("/models/**")
                .addResourceLocations("file:" + avatarModelsDir + "/");
    }
}