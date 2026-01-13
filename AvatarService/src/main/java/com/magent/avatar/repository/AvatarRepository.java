package com.magent.avatar.repository;

import com.magent.avatar.model.Avatar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvatarRepository extends JpaRepository<Avatar, Long> {

    List<Avatar> findByIsPublicTrue();

    List<Avatar> findByCreatedBy(String createdBy);

    List<Avatar> findByCategory(String category);

    @Query("SELECT a FROM Avatar a WHERE a.isPublic = true AND LOWER(a.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Avatar> searchPublicAvatars(@Param("searchTerm") String searchTerm);

    @Query("SELECT a FROM Avatar a WHERE a.isPublic = true AND :tag MEMBER OF a.tags")
    List<Avatar> findByTag(@Param("tag") String tag);

    List<Avatar> findByIsPublicTrueAndCategory(String category);
}