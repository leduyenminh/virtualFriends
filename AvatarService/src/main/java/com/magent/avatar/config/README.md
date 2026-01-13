# AvatarService Configuration Classes

This directory contains Spring Boot configuration classes for the AvatarService microservice.

## Configuration Classes

### AppConfig.java
- **Purpose**: Application-specific configuration properties
- **Properties**:
  - `app.upload-dir`: Directory for uploaded files (default: "uploads")
  - `app.avatar-models-dir`: Directory for Live2D model files (default: "avatar-models")
  - `app.max-file-size`: Maximum file upload size (default: 50MB)
  - `app.allowed-file-types`: Permitted file extensions for uploads

### DatabaseConfig.java
- **Purpose**: JPA and database configuration
- **Features**:
  - Enables JPA repositories in `com.magent.avatar.repository` package
  - Enables transaction management
  - Configures database connection and JPA settings

### FileUploadConfig.java
- **Purpose**: Multipart file upload configuration
- **Features**:
  - Configures Spring's multipart resolver for file uploads
  - Supports Live2D model file uploads (.moc3, textures, etc.)

### KafkaConfig.java
- **Purpose**: Apache Kafka messaging configuration
- **Features**:
  - Producer and consumer factory configuration
  - Kafka listener container factory
  - Message serialization/deserialization settings
  - Supports inter-service communication

### SecurityConfig.java
- **Purpose**: Spring Security configuration
- **Features**:
  - Disables CSRF for API endpoints
  - Stateless session management
  - Permits avatar API endpoints (`/api/avatar/**`)
  - Allows actuator health checks

### ServiceDiscoveryConfig.java
- **Purpose**: Eureka service discovery configuration
- **Features**:
  - Enables service discovery client
  - Registers service with Eureka server
  - Enables service-to-service communication

### StorageConfig.java
- **Purpose**: File storage and resource handling
- **Features**:
  - Configures resource handlers for uploaded files
  - Serves avatar model files via HTTP endpoints
  - Maps file system paths to web URLs

### WebConfig.java
- **Purpose**: Web MVC configuration
- **Features**:
  - CORS configuration for cross-origin requests
  - Allows all origins, methods, and headers
  - Supports credentials in CORS requests

## Usage

These configuration classes are automatically loaded by Spring Boot. You can override default values in `application.yml`:

```yaml
app:
  upload-dir: /custom/uploads
  avatar-models-dir: /custom/models
  max-file-size: 100MB
  allowed-file-types:
    - .png
    - .jpg
    - .moc3
    - .json

spring:
  kafka:
    bootstrap-servers: kafka-server:9092
```

## Dependencies

Make sure these dependencies are included in `pom.xml`:

- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-kafka`
- `spring-cloud-starter-netflix-eureka-client`
- `spring-boot-configuration-processor`