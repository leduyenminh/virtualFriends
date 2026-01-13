package com.magent.agent;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Magent Agent Service API")
                        .description("AI Agent Service for the Magent System - handles chat interactions, tool integrations, and user management")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Magent Team")
                                .email("support@magent.ai"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8082").description("Agent Service Development server"),
                        new Server().url("https://agent.magent.ai").description("Agent Service Production server")
                ));
    }
}