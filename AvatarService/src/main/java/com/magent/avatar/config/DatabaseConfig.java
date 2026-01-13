package com.magent.avatar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.magent.avatar.repository")
@EnableTransactionManagement
public class DatabaseConfig {
    // JPA and database configuration
    // Additional database-specific settings can be added here
}