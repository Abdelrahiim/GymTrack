"use server";

import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ExerciseInput = {
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
  }>;
};

export async function createWorkout(formData: {
  date: string;
  exercises: ExerciseInput[];
}) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    
    const { date, exercises } = formData;
    
    // Create the workout
    const workout = await prisma.workout.create({
      data: {
        date: new Date(date),
        userId: session.user.id,
        exercises: {
          create: exercises.map((exercise) => ({
            name: exercise.name,
            sets: {
              create: exercise.sets.map((set) => ({
                reps: set.reps,
                weight: set.weight,
              })),
            },
          })),
        },
      },
    });
    
    revalidatePath("/");
    return { workout };
  } catch (error) {
    console.error("Error creating workout:", error);
    throw new Error("Failed to create workout");
  }
}

export async function getWorkouts(userId?: string | null) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    
    const isAdmin = session.user.role === "ADMIN";
    
    // If admin and userId specified, get that user's workouts
    // Otherwise get current user's workouts
    const workouts = await prisma.workout.findMany({
      where: {
        userId: isAdmin && userId ? userId : session.user.id,
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    
    return { workouts };
  } catch (error) {
    console.error("Error fetching workouts:", error);
    throw new Error("Failed to fetch workouts");
  }
} 