"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { levelFormSchema, type LevelFormValues } from "@/lib/validations/levels"; // Ensure schema is imported if needed

export async function createLevelAction(userId: string, data: LevelFormValues) {
	try {
		const { workoutDays, ...levelData } = data;

		await prisma.level.create({
			data: {
				...levelData,
				userId: userId,
				// Nested write to create workout days
				workoutDays: workoutDays && workoutDays.length > 0 ? {
					create: workoutDays.map((day, index) => ({
						name: day.name,
						description: day.description,
						dayNumber: index + 1, // Assign day number based on array index
					})),
				} : undefined,
			},
		});
		revalidatePath(`/admin/users/${userId}`);
		return { success: true };
	} catch (error) {
		console.error("Error creating level:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create level";
		return { success: false, error: errorMessage };
	}
}

export async function updateLevelAction(
	levelId: string,
	userId: string,
	data: LevelFormValues,
) {
	try {
		const { workoutDays, ...levelData } = data;

		await prisma.$transaction(async (tx) => {
			// 1. Update level basic info
			await tx.level.update({
				where: { id: levelId, userId: userId },
				data: levelData,
			});

			// 2. Delete existing workout days for this level
			await tx.workoutDay.deleteMany({
				where: { levelId: levelId },
			});

			// 3. Create new workout days if provided
			if (workoutDays && workoutDays.length > 0) {
				await tx.workoutDay.createMany({
					data: workoutDays.map((day, index) => ({
						name: day.name,
						description: day.description,
						dayNumber: index + 1,
						levelId: levelId,
					})),
				});
			}
		});

		revalidatePath(`/admin/users/${userId}`);
		return { success: true };
	} catch (error) {
		console.error("Error updating level:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update level";
		return { success: false, error: errorMessage };
	}
}

export async function deleteLevelAction(levelId: string, userId: string) {
	try {
		const level = await prisma.level.findUnique({
			where: { id: levelId, userId: userId },
			select: { userId: true },
		});

		if (!level) {
			throw new Error("Level not found or user does not have permission.");
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { currentLevelId: true },
		});

		await prisma.$transaction(async (tx) => {
			if (user?.currentLevelId === levelId) {
				await tx.user.update({
					where: { id: userId },
					data: { currentLevelId: null },
				});
			}
			// WorkoutDays should be deleted automatically due to cascade delete in schema
			// if relation is defined correctly with onDelete: Cascade
			// Let's double check schema... Yes, Level->WorkoutDay is one-to-many,
			// but WorkoutDay->Level has the foreign key and onDelete: Cascade.
			// So deleting the Level should cascade delete WorkoutDays.

			await tx.level.delete({
				where: { id: levelId },
			});
		});

		revalidatePath(`/admin/users/${userId}`);
		return { success: true };
	} catch (error) {
		console.error("Error deleting level:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete level";
		return { success: false, error: errorMessage };
	}
} 