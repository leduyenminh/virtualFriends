package com.magent.avatar.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "avatar_instances")
public class AvatarInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avatar_id", nullable = false)
    private Avatar avatar;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String status; // "active", "idle", "animating"

    @Column
    private String currentEmotion; // "happy", "sad", "angry", "neutral"

    @Column
    private Double positionX = 0.0;

    @Column
    private Double positionY = 0.0;

    @Column
    private Double scale = 1.0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime lastActivity;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastActivity = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastActivity = LocalDateTime.now();
    }

    // Constructors
    public AvatarInstance() {}

    public AvatarInstance(String sessionId, Avatar avatar, String userId) {
        this.sessionId = sessionId;
        this.avatar = avatar;
        this.userId = userId;
        this.status = "active";
        this.currentEmotion = "neutral";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public Avatar getAvatar() { return avatar; }
    public void setAvatar(Avatar avatar) { this.avatar = avatar; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentEmotion() { return currentEmotion; }
    public void setCurrentEmotion(String currentEmotion) { this.currentEmotion = currentEmotion; }

    public Double getPositionX() { return positionX; }
    public void setPositionX(Double positionX) { this.positionX = positionX; }

    public Double getPositionY() { return positionY; }
    public void setPositionY(Double positionY) { this.positionY = positionY; }

    public Double getScale() { return scale; }
    public void setScale(Double scale) { this.scale = scale; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
}