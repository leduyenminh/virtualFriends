# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy source files
COPY AvatarService/ .

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-slim

WORKDIR /app

# Create non-root user for security
RUN useradd -m -u 1000 appuser

# Create directories for model storage and uploads
RUN mkdir -p /app/live2d-models /app/uploads && \
    chown -R appuser:appuser /app

# Copy jar from builder stage
COPY --from=builder /build/target/avatar-service-*.jar /app/app.jar
COPY --from=builder /build/src/main/resources/application.yml /app/application.yml

# Set permissions
RUN chmod +x /app/app.jar && \
    chown appuser:appuser /app/app.jar /app/application.yml

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8083

# Environment variables
ENV SERVER_PORT=8083 \
    SPRING_APPLICATION_NAME=avatar-service \
    APP_LIVE2D_STORAGE_PATH=/app/live2d-models \
    APP_UPLOAD_DIR=/app/uploads \
    APP_UPLOAD_MAX_SIZE=52428800

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8083/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
