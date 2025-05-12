import { z } from "zod";
import { WeightUnit } from "@/lib/generated/prisma/client";

export const setSchema = z.object({
  reps: z.number().min(1, { message: "Reps must be at least 1" }),
  weight: z.number().min(0, { message: "Weight must be 0 or higher" }),
  weightUnit: z.nativeEnum(WeightUnit),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, { message: "Exercise name is required" }),
  sets: z.array(setSchema).min(1, { message: "At least one set is required" }),
});

export const workoutSchema = z.object({
  name: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, { message: "At least one exercise is required" }),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>; 