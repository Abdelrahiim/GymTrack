"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma, WeightUnit } from "@/lib/generated/prisma/client";

// Define a more specific type for Workout with included relations
type WorkoutWithDetails = Prisma.WorkoutGetPayload<{
	include: {
		exercises: {
			include: {
				sets: true;
			};
		};
		user: {
			select: {
				name: true;
				image: true;
			};
		};
		workoutDay: {
			include: {
				level: true;
			};
		};
	};
}>;

type ExerciseInput = {
	name: string;
	sets: Array<{
		reps: number;
		weight: number;
		weightUnit: WeightUnit;
	}>;
};

export async function createWorkout(formData: {
	date: string;
	name: string | null;
	workoutDayId: string;
	exercises: ExerciseInput[];
}) {
	try {
		const session = await auth();

		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const { date, name, workoutDayId, exercises } = formData;

		// Create the workout
		const workout = await prisma.workout.create({
			data: {
				date: new Date(date),
				name: name,
				workoutDayId: workoutDayId,
				userId: session.user.id,
				exercises: {
					create: exercises.map((exercise) => ({
						name: exercise.name,
						sets: {
							create: exercise.sets.map((set) => ({
								reps: set.reps,
								weight: set.weight,
								weightUnit: set.weightUnit,
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
	workouts: WorkoutWithDetails[];
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
				workoutDay: {
					include: {
						level: true,
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

export async function getLastSevenDaysWorkouts(): Promise<{
	workouts: WorkoutWithDetails[];
}> {
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
			workoutDay: {
				include: {
					level: true,
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
			name: "asc",
		},
	});

	// Ensure names are not null and return the array of strings
	return distinctNames
		.map((item) => item.name)
		.filter((name) => name !== null) as string[];
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
			name: "asc",
		},
	});

	// Ensure names are not null and return the array of strings
	return distinctNames
		.map((item) => item.name)
		.filter((name) => name !== null) as string[];
}

// --- UPDATE WORKOUT ACTION ---
export async function updateWorkout(
	workoutId: string,
	formData: {
		date: string;
		name: string | null;
		workoutDayId: string;
		exercises: ExerciseInput[];
	},
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error("Unauthorized");
		}

		const { date, name, workoutDayId, exercises } = formData;

		// Verify the user owns the workout they are trying to update
		const existingWorkout = await prisma.workout.findUnique({
			where: {
				id: workoutId,
				userId: session.user.id,
			},
		});

		if (!existingWorkout) {
			throw new Error(
				"Workout not found or you do not have permission to edit it.",
			);
		}

		// Perform the update within a transaction
		await prisma.$transaction(async (tx) => {
			// 1. Delete existing exercises (and sets via cascading delete)
			await tx.exercise.deleteMany({
				where: {
					workoutId: workoutId,
				},
			});

			// 2. Update the workout itself (date, name)
			await tx.workout.update({
				where: {
					id: workoutId,
				},
				data: {
					date: new Date(date),
					name: name,
					workoutDayId: workoutDayId,
					// Create new exercises and sets
					exercises: {
						create: exercises.map((exercise) => ({
							name: exercise.name,
							sets: {
								create: exercise.sets.map((set) => ({
									reps: set.reps,
									weight: set.weight,
									weightUnit: set.weightUnit,
								})),
							},
						})),
					},
				},
			});
		});

		// Revalidate relevant paths
		revalidatePath("/"); // Revalidate dashboard
		revalidatePath(`/workout/${workoutId}`); // Revalidate workout details page
		revalidatePath(`/workout/${workoutId}/edit`); // Revalidate edit page itself
		revalidatePath("/workout"); // Revalidate workout list page
		// Optionally revalidate admin paths if needed
		// revalidatePath("/admin/workouts");

		return { success: true };
	} catch (error: unknown) {
		console.error("Error updating workout:", error);
		let errorMessage = "Failed to update workout";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		throw new Error(errorMessage);
	}
}

// Function to get workout day names from the user's current level
export async function getWorkoutDayNames() {
	const session = await auth();

	if (!session?.user?.id) {
		return [];
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: {
			currentLevel: {
				include: {
					workoutDays: {
						orderBy: { dayNumber: "asc" },
					},
				},
			},
		},
	});

	if (!user?.currentLevel?.workoutDays) {
		return [];
	}

	// Extract the names from workout days and ensure they're not null
	return user.currentLevel.workoutDays;
}

// Get a single workout by ID
export async function getWorkoutById(
	id: string,
): Promise<WorkoutWithDetails | null> {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const workout = await prisma.workout.findUnique({
		where: {
			id,
			userId: session.user.id,
		},
		include: {
			exercises: {
				include: {
					sets: true,
				},
				orderBy: {
					createdAt: "asc",
				},
			},
			user: {
				select: {
					name: true,
					image: true,
				},
			},
			workoutDay: {
				include: {
					level: true,
				},
			},
		},
	});

	return workout;
}
