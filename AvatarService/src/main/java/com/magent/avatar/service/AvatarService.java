package com.magent.avatar.service;

import com.magent.avatar.model.Avatar;
import com.magent.avatar.repository.AvatarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AvatarService {

    @Autowired
    private AvatarRepository avatarRepository;

    public List<Avatar> getAllPublicAvatars() {
        return avatarRepository.findByIsPublicTrue();
    }

    public List<Avatar> getAvatarsByCategory(String category) {
        return avatarRepository.findByIsPublicTrueAndCategory(category);
    }

    public Optional<Avatar> getAvatarById(Long id) {
        return avatarRepository.findById(id);
    }

    public List<Avatar> searchAvatars(String searchTerm) {
        return avatarRepository.searchPublicAvatars(searchTerm);
    }

    public List<Avatar> getAvatarsByTag(String tag) {
        return avatarRepository.findByTag(tag);
    }

    public Avatar createAvatar(Avatar avatar) {
        return avatarRepository.save(avatar);
    }

    public Avatar updateAvatar(Long id, Avatar avatarDetails) {
        Optional<Avatar> optionalAvatar = avatarRepository.findById(id);
        if (optionalAvatar.isPresent()) {
            Avatar avatar = optionalAvatar.get();
            avatar.setName(avatarDetails.getName());
            avatar.setDescription(avatarDetails.getDescription());
            avatar.setCategory(avatarDetails.getCategory());
            avatar.setTags(avatarDetails.getTags());
            avatar.setPublic(avatarDetails.isPublic());
            return avatarRepository.save(avatar);
        }
        throw new RuntimeException("Avatar not found with id: " + id);
    }

    public void deleteAvatar(Long id) {
        avatarRepository.deleteById(id);
    }

    public List<Avatar> getUserAvatars(String userId) {
        return avatarRepository.findByCreatedBy(userId);
    }
}