"use server";

import prisma from "@/lib/prisma"; // Assuming prisma is in lib
import { revalidatePath } from "next/cache";

export const handlePromote = async (
	userId: string,
	currentLevelId: string | null,
	userLevelsData: { id: string }[],
) => {
	try {
		const targetUserId = userId;
		const currentLevelIdFromUserObject = currentLevelId;
		const userSpecificLevels = userLevelsData;

		if (userSpecificLevels.length === 0) {
			console.log("No levels available for this user to promote to.");
			return;
		}

		let newLevelIdToAssign: string | null;

		if (!currentLevelIdFromUserObject) {
			newLevelIdToAssign = userSpecificLevels[0].id;
		} else {
			const currentIndex = userSpecificLevels.findIndex(
				(level) => level.id === currentLevelIdFromUserObject,
			);
			if (currentIndex === -1) {
				console.error(
					"Current assigned level not found in user's levels. Promoting to first level.",
				);
				newLevelIdToAssign = userSpecificLevels[0].id;
			} else if (currentIndex < userSpecificLevels.length - 1) {
				newLevelIdToAssign = userSpecificLevels[currentIndex + 1].id;
			} else {
				console.log("User is already at the highest level.");
				return;
			}
		}

		await prisma.user.update({
			where: { id: targetUserId },
			data: { currentLevelId: newLevelIdToAssign },
		});
		revalidatePath(`/admin/users/${targetUserId}`);
		console.log(`User ${targetUserId} promoted to level ${newLevelIdToAssign}`);
	} catch (error) {
		console.error("Failed to promote user:", error);
	}
};

export const handleDemote = async (
	userId: string,
	currentLevelId: string | null,
	userLevelsData: { id: string }[],
) => {
	try {
		const targetUserId = userId;
		const currentLevelIdFromUserObject = currentLevelId;
		const userSpecificLevels = userLevelsData;

		if (!currentLevelIdFromUserObject) {
			console.log("User has no assigned level to demote from.");
			return;
		}

		const currentIndex = userSpecificLevels.findIndex(
			(level) => level.id === currentLevelIdFromUserObject,
		);

		if (currentIndex === -1) {
			console.error(
				"Current assigned level not found in user's levels. Cannot demote.",
			);
			return;
		}

		let newLevelIdToAssign: string | null;
		if (currentIndex > 0) {
			newLevelIdToAssign = userSpecificLevels[currentIndex - 1].id;
		} else {
			newLevelIdToAssign = null; // Demote to no level
		}

		await prisma.user.update({
			where: { id: targetUserId },
			data: { currentLevelId: newLevelIdToAssign },
		});
		revalidatePath(`/admin/users/${targetUserId}`);
		console.log(
			`User ${targetUserId} demoted. New level ID: ${newLevelIdToAssign}`,
		);
	} catch (error) {
		console.error("Failed to demote user:", error);
	}
};
