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
  name: string | null;
  exercises: ExerciseInput[];
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { date, name, exercises } = formData;

    // Create the workout
    const workout = await prisma.workout.create({
      data: {
        date: new Date(date),
        name: name,
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
  name?: string;
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
  name = "",
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
    ...(name && {
      name: {
        equals: name,
        mode: "insensitive",
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

// New function to get distinct workout names for the logged-in user
export async function getDistinctWorkoutNames(): Promise<string[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const distinctNames = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      name: {
        not: null, // Only include workouts that have a name
      },
    },
    select: {
      name: true,
    },
    distinct: ["name"],
    orderBy: {
      name: 'asc'
    }
  });

  // Ensure names are not null and return the array of strings
  return distinctNames.map(item => item.name).filter(name => name !== null) as string[];
}

// New function to get distinct workout names across ALL users (for admin)
export async function getAllDistinctWorkoutNames(): Promise<string[]> {
    const session = await auth();
    
    // Ensure user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
        return [];
    }
    
    const distinctNames = await prisma.workout.findMany({
        where: {
            name: {
                not: null, // Only include workouts that have a name
            },
        },
        select: {
            name: true,
        },
        distinct: ["name"],
        orderBy: {
            name: 'asc'
        }
    });
    
    // Ensure names are not null and return the array of strings
    return distinctNames.map(item => item.name).filter(name => name !== null) as string[];
}
