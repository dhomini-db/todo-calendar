package com.todocalendar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "follows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {

    @EmbeddedId
    private FollowId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("followerId")
    @JoinColumn(name = "follower_id")
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("followingId")
    @JoinColumn(name = "following_id")
    private User following;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Composite PK ──────────────────────────────────────────────

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowId implements Serializable {

        @Column(name = "follower_id")
        private Long followerId;

        @Column(name = "following_id")
        private Long followingId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof FollowId)) return false;
            FollowId that = (FollowId) o;
            return Objects.equals(followerId, that.followerId) &&
                   Objects.equals(followingId, that.followingId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(followerId, followingId);
        }
    }
}
