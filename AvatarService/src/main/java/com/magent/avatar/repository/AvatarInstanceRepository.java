package com.magent.avatar.repository;

import com.magent.avatar.model.AvatarInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AvatarInstanceRepository extends JpaRepository<AvatarInstance, Long> {

    Optional<AvatarInstance> findBySessionId(String sessionId);

    List<AvatarInstance> findByUserId(String userId);

    List<AvatarInstance> findByStatus(String status);

    @Query("SELECT ai FROM AvatarInstance ai WHERE ai.lastActivity < :cutoffTime")
    List<AvatarInstance> findInactiveInstances(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Modifying
    @Query("DELETE FROM AvatarInstance ai WHERE ai.lastActivity < :cutoffTime")
    void deleteInactiveInstances(@Param("cutoffTime") LocalDateTime cutoffTime);

    boolean existsBySessionId(String sessionId);
}