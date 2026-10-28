package com.kcalorix.notification.repository;

import com.kcalorix.notification.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {

    List<PushSubscription> findByUserId(UUID userId);

    Optional<PushSubscription> findByEndpoint(String endpoint);

    @Modifying
    @Query("delete from PushSubscription s where s.endpoint = :endpoint and s.user.id = :userId")
    int deleteByEndpointAndUserId(@Param("endpoint") String endpoint, @Param("userId") UUID userId);
}