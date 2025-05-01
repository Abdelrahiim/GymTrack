"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma";

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

interface GetWorkoutsParams {
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface GetWorkoutsResult {
  workouts: any[];
  total: number;
  totalPages: number;
}

export async function getWorkouts({
  search = "",
  page = 1,
  limit = 10,
}: GetWorkoutsParams = {}): Promise<GetWorkoutsResult> {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isAdmin = session.user.role === "ADMIN";
  const skip = (page - 1) * limit;

  const where: Prisma.WorkoutWhereInput = {
    userId: isAdmin && session.user.id ? session.user.id : session.user.id,
    ...(search && {
      exercises: {
        some: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    }),
  };

  const [workouts, total] = await Promise.all([
    prisma.workout.findMany({
      where,
      skip,
      take: limit,
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.workout.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    workouts,
    total,
    totalPages,
  };
}

export async function getLastSevenDaysWorkouts(): Promise<{ workouts: any[] }> {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isAdmin = session.user.role === "ADMIN";
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: isAdmin && session.user.id ? session.user.id : session.user.id,
      date: {
        gte: sevenDaysAgo,
        lte: today,
      },
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return { workouts };
}
