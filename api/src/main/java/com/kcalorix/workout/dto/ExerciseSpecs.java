package com.kcalorix.workout.dto;

import com.kcalorix.workout.entity.Exercise;
import com.kcalorix.workout.entity.enums.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;

public final class ExerciseSpecs {

    private ExerciseSpecs() {}

    private static Specification<Exercise> all() {
        return (root, query, cb) -> cb.conjunction();
    }

    public static Specification<Exercise> active() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    public static Specification<Exercise> muscle(MuscleGroup m) {
        if (m == null) return all();
        return (root, query, cb) -> cb.equal(root.get("primaryMuscle"), m);
    }

    public static Specification<Exercise> category(ExerciseCategory c) {
        if (c == null) return all();
        return (root, query, cb) -> cb.equal(root.get("category"), c);
    }

    public static Specification<Exercise> equipment(Equipment e) {
        if (e == null) return all();
        return (root, query, cb) -> cb.equal(root.get("equipment"), e);
    }

    /** Restricts to the equipment a user can actually use. A null set means no restriction. */
    public static Specification<Exercise> equipmentIn(Set<Equipment> allowed) {
        if (allowed == null) return all();
        return (root, query, cb) -> root.get("equipment").in(allowed);
    }

    public static Specification<Exercise> difficulty(Difficulty d) {
        if (d == null) return all();
        return (root, query, cb) -> cb.equal(root.get("difficulty"), d);
    }

    public static Specification<Exercise> nameContains(String q) {
        if (q == null || q.isBlank()) return all();
        String escaped = q.trim().toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        String pattern = "%" + escaped + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern, '\\');
    }
}