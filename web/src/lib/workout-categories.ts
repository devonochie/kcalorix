import {
  Activity, Dumbbell, Flame, Footprints, Gem, Layers, Mountain, Shield, Target,
  type LucideIcon,
} from "lucide-react";
import { WorkoutCategory } from "@/types";

export const WORKOUT_CATEGORIES: { key: WorkoutCategory; label: string; blurb: string; icon: LucideIcon; image: string }[] = [
  { key: WorkoutCategory.FULL_BODY, label: "Full Body", blurb: "Strength and cardio for every major muscle group.", icon: Activity, image: "/images/workouts/full-body.jpg" },
  { key: WorkoutCategory.CHEST, label: "Chest", blurb: "Push-ups, dips and pressing for a stronger chest.", icon: Shield, image: "/images/workouts/chest.jpg" },
  { key: WorkoutCategory.BACK, label: "Back", blurb: "Rows and pulls for a wide, strong back and better posture.", icon: Layers, image: "/images/workouts/back.jpg" },
  { key: WorkoutCategory.SHOULDERS, label: "Shoulders", blurb: "Build round, strong, stable shoulders.", icon: Mountain, image: "/images/workouts/shoulders.jpg" },
  { key: WorkoutCategory.ARMS, label: "Arms", blurb: "Biceps and triceps, from bodyweight to dumbbells.", icon: Dumbbell, image: "/images/workouts/arms.jpg" },
  { key: WorkoutCategory.LEGS, label: "Legs", blurb: "Squats, lunges and power for strong legs.", icon: Footprints, image: "/images/workouts/legs.jpg" },
  { key: WorkoutCategory.GLUTES, label: "Glutes", blurb: "Bridges, hinges and jumps to shape and strengthen your glutes.", icon: Gem, image: "/images/workouts/glutes.jpg" },
  { key: WorkoutCategory.ABS_CORE, label: "Core", blurb: "Abs, obliques and a strong middle.", icon: Target, image: "/images/workouts/abs-core.jpg" },
  { key: WorkoutCategory.CARDIO_HIIT, label: "Cardio", blurb: "Raise your heart rate and burn more calories.", icon: Flame, image: "/images/workouts/cardio-hiit.jpg" },
];