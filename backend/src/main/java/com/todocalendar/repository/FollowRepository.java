package com.todocalendar.repository;

import com.todocalendar.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Follow.FollowId> {

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /** Number of people following a given user. */
    long countByFollowingId(Long followingId);

    /** Number of people a given user follows. */
    long countByFollowerId(Long followerId);

    /** IDs of users that the given user follows — used for bulk isFollowing checks. */
    @Query("SELECT f.id.followingId FROM Follow f WHERE f.id.followerId = :followerId")
    List<Long> findFollowingIdsByFollowerId(@Param("followerId") Long followerId);
}
