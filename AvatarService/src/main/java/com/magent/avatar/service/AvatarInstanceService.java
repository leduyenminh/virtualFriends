package com.magent.avatar.service;

import com.magent.avatar.model.Avatar;
import com.magent.avatar.model.AvatarInstance;
import com.magent.avatar.repository.AvatarInstanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AvatarInstanceService {

    @Autowired
    private AvatarInstanceRepository instanceRepository;

    @Autowired
    private AvatarService avatarService;

    public AvatarInstance createAvatarInstance(Long avatarId, String userId) {
        Optional<Avatar> avatar = avatarService.getAvatarById(avatarId);
        if (avatar.isEmpty()) {
            throw new RuntimeException("Avatar not found with id: " + avatarId);
        }

        String sessionId = UUID.randomUUID().toString();
        AvatarInstance instance = new AvatarInstance(sessionId, avatar.get(), userId);
        return instanceRepository.save(instance);
    }

    public Optional<AvatarInstance> getAvatarInstance(String sessionId) {
        return instanceRepository.findBySessionId(sessionId);
    }

    public List<AvatarInstance> getUserAvatarInstances(String userId) {
        return instanceRepository.findByUserId(userId);
    }

    public void updateAvatarEmotion(String sessionId, String emotion) {
        Optional<AvatarInstance> instance = instanceRepository.findBySessionId(sessionId);
        if (instance.isPresent()) {
            instance.get().setCurrentEmotion(emotion);
            instance.get().setStatus("animating");
            instanceRepository.save(instance.get());
        }
    }

    public void updateAvatarPosition(String sessionId, Double x, Double y, Double scale) {
        Optional<AvatarInstance> instance = instanceRepository.findBySessionId(sessionId);
        if (instance.isPresent()) {
            AvatarInstance avatarInstance = instance.get();
            avatarInstance.setPositionX(x);
            avatarInstance.setPositionY(y);
            avatarInstance.setScale(scale);
            instanceRepository.save(avatarInstance);
        }
    }

    public void updateAvatarStatus(String sessionId, String status) {
        Optional<AvatarInstance> instance = instanceRepository.findBySessionId(sessionId);
        if (instance.isPresent()) {
            instance.get().setStatus(status);
            instanceRepository.save(instance.get());
        }
    }

    public void destroyAvatarInstance(String sessionId) {
        Optional<AvatarInstance> instance = instanceRepository.findBySessionId(sessionId);
        instance.ifPresent(avatarInstance -> instanceRepository.delete(avatarInstance));
    }

    // Clean up inactive instances every 5 minutes
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void cleanupInactiveInstances() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(30); // 30 minutes inactivity
        List<AvatarInstance> inactiveInstances = instanceRepository.findInactiveInstances(cutoffTime);
        if (!inactiveInstances.isEmpty()) {
            instanceRepository.deleteInactiveInstances(cutoffTime);
            System.out.println("Cleaned up " + inactiveInstances.size() + " inactive avatar instances");
        }
    }
}