import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import prisma from "@/lib/prisma";

export default async function NewWorkout() {
	const session = await auth();

	if (!session) {
		redirect("/auth/signin");
	}

	// Fetch user with their current level
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			currentLevelId: true,
			currentLevel: {
				include: {
					workoutDays: true
				}
			}
		}
	});

	if (!user?.currentLevelId || !user?.currentLevel) {
		// Redirect to level selection page or show message if user has no level assigned
		// For now, just redirect to dashboard
		redirect("/dashboard");
	}

	const workoutDays = user.currentLevel.workoutDays;

	return (
		<div className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
			<WorkoutHeader title="Log New Workout" />
			<WorkoutForm workoutDays={workoutDays} />
		</div>
	);
}
