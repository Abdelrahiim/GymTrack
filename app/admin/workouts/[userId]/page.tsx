import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutProgressChart } from "@/components/admin/WorkoutProgressChart";
import { WorkoutList } from "@/components/admin/WorkoutList";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight, User, Dumbbell, Calendar } from "lucide-react";

export default async function UserWorkoutsPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const session = await auth();
	console.log(session);
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
			levels: {
				include: {
					workoutDays: {
						orderBy: {
							dayNumber: 'asc',
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			},
		},
	});

	if (!user) {
		redirect("/admin/workouts");
	}

	return (
		<div className="container max-w-7xl mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10">
			{/* Header Section */}
			<div className="border-b pb-4 sm:pb-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
							{user.name || "Unnamed User"}'s Profile
						</h1>
						<p className="text-muted-foreground mt-1 flex items-center text-sm">
							<User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
							{user.email}
						</p>
					</div>
					<Link 
						href="/admin/workouts" 
						className="mt-2 sm:mt-0 inline-flex items-center text-sm font-medium text-primary hover:underline"
					>
						← Back to All Users
					</Link>
				</div>
			</div>

			{/* Stats Section */}
			<section aria-labelledby="stats-heading">
				<h2 id="stats-heading" className="sr-only">Workout Statistics</h2>
				<div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
							<CardTitle className="text-xs sm:text-sm font-medium">
								Total Workouts
							</CardTitle>
							<Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent className="px-4 sm:px-6 pt-0 pb-4">
							<p className="text-xl sm:text-2xl md:text-3xl font-bold">{user.workouts.length}</p>
							<p className="text-xs text-muted-foreground mt-1">All-time completed workouts</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
							<CardTitle className="text-xs sm:text-sm font-medium">
								Total Exercises
							</CardTitle>
							<Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent className="px-4 sm:px-6 pt-0 pb-4">
							<p className="text-xl sm:text-2xl md:text-3xl font-bold">
								{user.workouts.reduce(
									(acc, workout) => acc + workout.exercises.length,
									0,
								)}
							</p>
							<p className="text-xs text-muted-foreground mt-1">Exercises performed in workouts</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow col-span-1 xs:col-span-2 lg:col-span-1">
						<CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
							<CardTitle className="text-xs sm:text-sm font-medium">Total Sets</CardTitle>
							<svg 
								xmlns="http://www.w3.org/2000/svg" 
								width="12"
								height="12"
								className="sm:w-4 sm:h-4 text-muted-foreground"
								viewBox="0 0 24 24" 
								fill="none" 
								stroke="currentColor" 
								strokeWidth="2" 
								strokeLinecap="round" 
								strokeLinejoin="round" 
								aria-hidden="true"
							>
								<path d="M8 4h8" />
								<path d="M8 12h8" />
								<path d="M8 20h8" />
								<path d="M4 4v16" />
								<path d="M20 4v16" />
							</svg>
						</CardHeader>
						<CardContent className="px-4 sm:px-6 pt-0 pb-4">
							<p className="text-xl sm:text-2xl md:text-3xl font-bold">
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
							<p className="text-xs text-muted-foreground mt-1">Total exercise sets completed</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Training Programs Section */}
			<section aria-labelledby="training-heading" className="pt-2 sm:pt-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
					<h2 id="training-heading" className="text-lg sm:text-xl font-semibold flex items-center gap-2">
						<Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
						Training Programs
					</h2>
					{/* This can be a future CTA button */}
				</div>
				
				{user.levels.length === 0 ? (
					<Card className="bg-muted/10 border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-6 sm:py-10 text-center px-4">
							<p className="text-sm text-muted-foreground mb-2">No training levels set up for this user yet.</p>
							{/* Optionally add a CTA button here to create a level */}
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
						{user.levels.map((level) => (
							<Card key={level.id} className="overflow-hidden border hover:shadow-md transition-shadow">
								<CardHeader className="bg-muted/20 pb-2 sm:pb-3 border-b px-4 sm:px-6">
									<div className="flex items-center justify-between">
										<CardTitle className="text-sm sm:text-base">
											{level.name}
										</CardTitle>
										{level.id === user.currentLevelId && (
											<Badge className="bg-primary/90 hover:bg-primary text-xs">Current</Badge>
										)}
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{level.daysPerWeek} days per week
									</p>
								</CardHeader>
								<CardContent className="p-0">
									<ul className="divide-y">
										{level.workoutDays.map((day) => (
											<li key={day.id} className="transition-colors">
												<Link 
													href={`/admin/workouts/${userId}/levels/${encodeURIComponent(level.name)}/${encodeURIComponent(day.name)}`}
													className="flex items-center justify-between w-full p-3 sm:p-4 text-xs sm:text-sm hover:bg-muted/10"
												>
													<div className="overflow-hidden">
														<span className="font-medium block">{day.name}</span>
														<p className="text-xs text-muted-foreground truncate max-w-[160px] sm:max-w-[200px] mt-0.5">
															{day.description || "No description"}
														</p>
													</div>
													<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 ml-2" />
												</Link>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</section>

			{/* Charts Section */}
			<section aria-labelledby="analytics-heading" className="pt-2 sm:pt-4">
				<h2 id="analytics-heading" className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Workout Analytics</h2>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
					<Card>
						<CardHeader className="border-b px-4 sm:px-6">
							<CardTitle className="text-sm sm:text-base">Progress Chart</CardTitle>
						</CardHeader>
						<CardContent className="pt-4 sm:pt-6 px-2 sm:px-4 overflow-x-auto">
							{user.workouts.length > 0 ? (
								<div className="min-w-[300px]">
									<WorkoutProgressChart workouts={user.workouts} />
								</div>
							) : (
								<p className="text-center text-xs sm:text-sm text-muted-foreground py-6 sm:py-10">No workout data available yet</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="border-b px-4 sm:px-6">
							<CardTitle className="text-sm sm:text-base">Recent Workouts</CardTitle>
						</CardHeader>
						<CardContent className="pt-4 sm:pt-6 px-2 sm:px-4 overflow-x-auto">
							{user.workouts.length > 0 ? (
								<div className="min-w-[300px]">
									<WorkoutList workouts={user.workouts} />
								</div>
							) : (
								<p className="text-center text-xs sm:text-sm text-muted-foreground py-6 sm:py-10">No workouts recorded yet</p>
							)}
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
