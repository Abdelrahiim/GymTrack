import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutProgressChart } from "@/components/admin/WorkoutProgressChart";
import { WorkoutList } from "@/components/admin/WorkoutList";

export default async function UserWorkoutsPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const session = await auth();

	if (!session) {
		redirect("/auth/signin");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/");
	}

	const { userId } = await Promise.resolve(params);

	// Get user details and their workouts
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			workouts: {
				orderBy: {
					createdAt: "desc",
				},
				include: {
					exercises: {
						include: {
							sets: true,
						},
					},
				},
			},
		},
	});

	if (!user) {
		redirect("/admin/workouts");
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">
					{user.name || "Unnamed User"}'s Workouts
				</h1>
				<p className="text-muted-foreground">{user.email}</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Total Workouts
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{user.workouts.length}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">
							Total Exercises
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{user.workouts.reduce(
								(acc, workout) => acc + workout.exercises.length,
								0,
							)}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Total Sets</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{user.workouts.reduce(
								(acc, workout) =>
									acc +
									workout.exercises.reduce(
										(acc, exercise) => acc + exercise.sets.length,
										0,
									),
								0,
							)}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Progress Chart</CardTitle>
					</CardHeader>
					<CardContent>
						<WorkoutProgressChart workouts={user.workouts} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Recent Workouts</CardTitle>
					</CardHeader>
					<CardContent>
						<WorkoutList workouts={user.workouts} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
