package com.magent.avatar.controller;

import com.magent.avatar.model.AvatarInstance;
import com.magent.avatar.service.AvatarInstanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/avatar/instances")
@Tag(name = "Avatar Instances", description = "Live2D avatar instance management and real-time control")
public class AvatarInstanceController {

    @Autowired
    private AvatarInstanceService instanceService;

    @PostMapping("/{avatarId}")
    @Operation(summary = "Create avatar instance", description = "Create a new avatar instance for real-time interaction")
    public ResponseEntity<?> createAvatarInstance(@Parameter(description = "Avatar ID") @PathVariable Long avatarId,
                                                 @RequestHeader("X-User") String userId) {
        try {
            AvatarInstance instance = instanceService.createAvatarInstance(avatarId, userId);
            return ResponseEntity.ok(Map.of(
                "sessionId", instance.getSessionId(),
                "instance", instance
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get avatar instance", description = "Get avatar instance by session ID")
    public ResponseEntity<AvatarInstance> getAvatarInstance(@Parameter(description = "Session ID") @PathVariable String sessionId) {
        Optional<AvatarInstance> instance = instanceService.getAvatarInstance(sessionId);
        return instance.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user")
    @Operation(summary = "Get user avatar instances", description = "Get all avatar instances for the current user")
    public ResponseEntity<List<AvatarInstance>> getUserAvatarInstances(@RequestHeader("X-User") String userId) {
        List<AvatarInstance> instances = instanceService.getUserAvatarInstances(userId);
        return ResponseEntity.ok(instances);
    }

    @PutMapping("/session/{sessionId}/emotion")
    @Operation(summary = "Update avatar emotion", description = "Change the avatar's current emotion/expression")
    public ResponseEntity<?> updateAvatarEmotion(@Parameter(description = "Session ID") @PathVariable String sessionId,
                                                @Parameter(description = "Emotion name") @RequestParam String emotion) {
        try {
            instanceService.updateAvatarEmotion(sessionId, emotion);
            return ResponseEntity.ok(Map.of("status", "emotion_updated", "emotion", emotion));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/session/{sessionId}/position")
    @Operation(summary = "Update avatar position", description = "Update avatar position and scale on screen")
    public ResponseEntity<?> updateAvatarPosition(@Parameter(description = "Session ID") @PathVariable String sessionId,
                                                 @Parameter(description = "X position") @RequestParam Double x,
                                                 @Parameter(description = "Y position") @RequestParam Double y,
                                                 @Parameter(description = "Scale factor") @RequestParam(defaultValue = "1.0") Double scale) {
        try {
            instanceService.updateAvatarPosition(sessionId, x, y, scale);
            return ResponseEntity.ok(Map.of("status", "position_updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/session/{sessionId}/status")
    @Operation(summary = "Update avatar status", description = "Update avatar instance status (active, idle, animating)")
    public ResponseEntity<?> updateAvatarStatus(@Parameter(description = "Session ID") @PathVariable String sessionId,
                                               @Parameter(description = "Status") @RequestParam String status) {
        try {
            instanceService.updateAvatarStatus(sessionId, status);
            return ResponseEntity.ok(Map.of("status", "status_updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/session/{sessionId}")
    @Operation(summary = "Destroy avatar instance", description = "Destroy an avatar instance and free up resources")
    public ResponseEntity<?> destroyAvatarInstance(@Parameter(description = "Session ID") @PathVariable String sessionId) {
        try {
            instanceService.destroyAvatarInstance(sessionId);
            return ResponseEntity.ok(Map.of("status", "instance_destroyed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/session/{sessionId}/motion")
    @Operation(summary = "Trigger avatar motion", description = "Trigger a specific motion/animation on the avatar")
    public ResponseEntity<?> triggerAvatarMotion(@Parameter(description = "Session ID") @PathVariable String sessionId,
                                                @Parameter(description = "Motion name") @RequestParam String motion,
                                                @Parameter(description = "Priority (0-3)") @RequestParam(defaultValue = "1") Integer priority) {
        try {
            // Update status to animating
            instanceService.updateAvatarStatus(sessionId, "animating");

            return ResponseEntity.ok(Map.of(
                "status", "motion_triggered",
                "motion", motion,
                "priority", priority
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}