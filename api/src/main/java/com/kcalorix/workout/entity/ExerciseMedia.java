package com.kcalorix.workout.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseMedia {

    @Column(name = "video_path")
    private String videoPath;

    @Column(name = "thumbnail_path")
    private String thumbnailPath;

    @Column(name = "animation_key")
    private String animationKey;
}
