"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getUserLevelInfo() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/auth/signin");
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
			levels: {
				include: {
					workoutDays: {
						orderBy: { dayNumber: "asc" },
					},
				},
				orderBy: { createdAt: "asc" },
			},
			workouts: {
				where: {
					date: {
						gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
					},
				},
				include: {
					workoutDay: true,
					exercises: {
						include: {
							sets: true,
						},
					},
				},
				orderBy: { date: "desc" },
			},
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	// Calculate the current week's progress
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - dayOfWeek);
	weekStart.setHours(0, 0, 0, 0);

	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);
	weekEnd.setHours(23, 59, 59, 999);

	const currentWeekWorkouts = await prisma.workout.findMany({
		where: {
			userId: session.user.id,
			date: {
				gte: weekStart,
				lte: weekEnd,
			},
		},
		include: {
			workoutDay: true,
		},
		orderBy: { date: "asc" },
	});

	// Get completed days for the current week
	const completedDayNumbers = new Set(
		currentWeekWorkouts
			.filter((workout) => workout.workoutDay)
			.map((workout) => workout.workoutDay?.dayNumber),
	);

	// Get workout stats
	const totalWorkouts = await prisma.workout.count({
		where: { userId: session.user.id },
	});

	const totalExercises = await prisma.exercise.count({
		where: {
			workout: {
				userId: session.user.id,
			},
		},
	});

	const totalSets = await prisma.set.count({
		where: {
			exercise: {
				workout: {
					userId: session.user.id,
				},
			},
		},
	});

	// Calculate streaks
	const allWorkoutDates = await prisma.workout.findMany({
		where: { userId: session.user.id },
		select: { date: true },
		orderBy: { date: "desc" },
	});

	const dates = allWorkoutDates.map((w) => new Date(w.date).toDateString());
	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreak = 0;

	// Calculate current streak (consecutive days including today)
	const todayStr = new Date().toDateString();
	if (dates.includes(todayStr)) {
		currentStreak = 1;
		const checkDate = new Date();

		while (true) {
			checkDate.setDate(checkDate.getDate() - 1);
			const checkDateStr = checkDate.toDateString();

			if (dates.includes(checkDateStr)) {
				currentStreak++;
			} else {
				break;
			}
		}
	}

	// Calculate longest streak
	const sortedDates = [...new Set(dates)]
		.map((d) => new Date(d))
		.sort((a, b) => a.getTime() - b.getTime());

	for (let i = 0; i < sortedDates.length; i++) {
		if (i === 0) {
			tempStreak = 1;
		} else {
			const prevDate = new Date(sortedDates[i - 1]);
			const currDate = new Date(sortedDates[i]);

			// Check if dates are consecutive
			prevDate.setDate(prevDate.getDate() + 1);
			if (prevDate.toDateString() === currDate.toDateString()) {
				tempStreak++;
			} else {
				if (tempStreak > longestStreak) {
					longestStreak = tempStreak;
				}
				tempStreak = 1;
			}
		}
	}

	if (tempStreak > longestStreak) {
		longestStreak = tempStreak;
	}

	return {
		user: {
			name: user.name,
			email: user.email,
			image: user.image,
		},
		currentLevel: user.currentLevel,
		allLevels: user.levels,
		recentWorkouts: user.workouts,
		weekProgress: {
			startDate: weekStart,
			endDate: weekEnd,
			completedDays: Array.from(completedDayNumbers),
			totalDays: user.currentLevel?.daysPerWeek || 0,
		},
		stats: {
			totalWorkouts,
			totalExercises,
			totalSets,
			currentStreak,
			longestStreak,
		},
	};
}
