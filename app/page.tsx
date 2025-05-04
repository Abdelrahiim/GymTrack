import { redirect } from "next/navigation";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { getWorkouts, getLastSevenDaysWorkouts } from "@/actions/workouts";
import Link from "next/link";
import { auth } from "@/auth";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, List } from "lucide-react";

interface Set {
	id: string;
	reps: number;
	weight: number | null;
}

interface Exercise {
	id: string;
	name: string;
	sets: Set[];
}

interface Workout {
	id: string;
	date: Date;
	exercises: Exercise[];
}

export default async function Home() {
	const session = (await auth()) as Session & {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			role?: string | null;
		};
	};

	if (!session) {
		redirect("/auth/signin");
	}

	const { workouts: recentWorkouts } = await getLastSevenDaysWorkouts();

	const totalWorkouts = recentWorkouts.length;
	const totalExercises = recentWorkouts.reduce(
		(count, workout) => count + workout.exercises.length,
		0,
	);
	const totalSets = recentWorkouts.reduce(
		(count: number, workout) =>
			count +
			workout.exercises.reduce(
				(sets: number, exercise) => sets + exercise.sets.length,
				0,
			),
		0,
	);

	const transformedWorkouts = recentWorkouts.map((workout) => ({
		id: workout.id,
		date: workout.date.toISOString(),
		name: workout.name,
		exercises: workout.exercises.map((exercise) => ({
			name: exercise.name,
			sets: exercise.sets.map((set) => ({
				reps: set.reps,
				weight: set.weight || 0,
			})),
		})),
	}));

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<div className="mb-8">
				<h1 className="text-3xl font-extrabold tracking-tight">
					Welcome, {session.user.name || "User"}
				</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					Track your gym progress and achieve your fitness goals
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-8">
					<section>
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold">Last 7 Days Progress</h2>
							<span
								className={cn(
									"px-4 py-1 rounded-full text-sm font-medium",
									"bg-primary/10 text-primary",
								)}
							>
								Last 7 Days
							</span>
						</div>
						<WeeklyProgress workouts={recentWorkouts} />
					</section>

					<section>
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold">Recent Workouts</h2>
							{recentWorkouts.length > 0 && (
								<Link
									href="/workout"
									className="text-primary hover:text-primary/80 font-medium"
								>
									View all →
								</Link>
							)}
						</div>

						{recentWorkouts.length > 0 ? (
							<div className="space-y-6">
								{transformedWorkouts.slice(0, 5).map((workout) => (
									<WorkoutCard key={workout.id} workout={workout} />
								))}
							</div>
						) : (
							<Card>
								<CardContent className="p-8 text-center">
									<Dumbbell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground text-lg mb-4">
										No workouts recorded yet.
									</p>
									<Button asChild>
										<Link href="/workout/new">Log Your First Workout</Link>
									</Button>
								</CardContent>
							</Card>
						)}
					</section>
				</div>

				<div className="lg:col-span-1 space-y-8">
					<Card className="border-none bg-gradient-to-b from-muted/50 to-muted shadow-md">
						<CardHeader>
							<CardTitle>Quick Stats</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="bg-background/50 backdrop-blur-sm rounded-lg p-4">
								<p className="text-sm font-medium">Workouts This Week</p>
								<div className="flex items-end justify-between">
									<p className="text-4xl font-extrabold mt-1">
										{recentWorkouts.length}
									</p>
									<p className="text-muted-foreground">of 7 days</p>
								</div>
								<Progress
									value={Math.min(100, (recentWorkouts.length / 7) * 100)}
									className="mt-2"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<Card className="bg-background/50 backdrop-blur-sm border-none">
									<CardContent className="p-4">
										<p className="text-sm font-medium">Total Workouts</p>
										<p className="text-3xl font-bold mt-1">{totalWorkouts}</p>
									</CardContent>
								</Card>

								<Card className="bg-background/50 backdrop-blur-sm border-none">
									<CardContent className="p-4">
										<p className="text-sm font-medium">Total Exercises</p>
										<p className="text-3xl font-bold mt-1">{totalExercises}</p>
									</CardContent>
								</Card>

								<Card className="col-span-2 bg-background/50 backdrop-blur-sm border-none">
									<CardContent className="p-4">
										<p className="text-sm font-medium">Total Sets</p>
										<p className="text-3xl font-bold mt-1">{totalSets}</p>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button asChild className="w-full">
								<Link href="/workout/new">
									<Plus className="mr-2 h-4 w-4" />
									Log New Workout
								</Link>
							</Button>

							<Button asChild variant="outline" className="w-full">
								<Link href="/workout">
									<List className="mr-2 h-4 w-4" />
									View All Workouts
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
