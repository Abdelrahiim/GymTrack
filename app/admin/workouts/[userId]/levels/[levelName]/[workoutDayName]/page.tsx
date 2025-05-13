import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getAdminLevelWorkoutDayData } from "@/actions/levels";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExerciseProgressChart } from "@/components/levels/ExerciseProgressChart";
import {
	ChevronLeft,
	CalendarClock,
	BarChart3,
	Dumbbell,
	TrendingUp,
	ArrowUp,
	ArrowDown,
	Minus,
	User,
	Calendar,
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { WeightUnit } from "@/lib/prisma";

interface AdminWorkoutDayPageProps {
	params: Promise<{
		userId: string;
		levelName: string;
		workoutDayName: string;
	}>;
}

export default async function WorkoutDayPage({
	params,
}: AdminWorkoutDayPageProps) {
	const session = await auth();

	if (!session) {
		redirect("/auth/signin");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/");
	}

	const { userId, levelName, workoutDayName } = await Promise.resolve(params);
	const decodedLevelName = decodeURIComponent(levelName);
	const decodedWorkoutDayName = decodeURIComponent(workoutDayName);

	try {
		// Get admin-specific data for this user's level and workout day
		const data = await getAdminLevelWorkoutDayData(
			userId,
			decodedLevelName,
			decodedWorkoutDayName,
		);
		const { level, workoutDay, workouts, exerciseProgress, stats } = data;

		// Get all unique exercise names across all workouts
		const allExercises = new Set<string>();
		for (const workout of workouts) {
			for (const exercise of workout.exercises) {
				allExercises.add(exercise.name);
			}
		}

		// Get last two workouts for comparison
		const lastWorkout =
			workouts.length > 0 ? workouts[workouts.length - 1] : null;
		const previousWorkout =
			workouts.length > 1 ? workouts[workouts.length - 2] : null;
		const lastWorkoutDate = lastWorkout ? new Date(lastWorkout.date) : null;

		// Organize exercises by workout for comparison
		type ExerciseSummary = {
			name: string;
			maxWeight: number;
			totalReps: number;
			totalVolume: number;
			weightUnit: WeightUnit;
			change?: {
				weight: number;
				reps: number;
				volume: number;
			};
		};

		const getExerciseSummaries = (
			workout: typeof lastWorkout,
		): Record<string, ExerciseSummary> => {
			const summaries: Record<string, ExerciseSummary> = {};

			if (!workout) return summaries;

			for (const exercise of workout.exercises) {
				let maxWeight = 0;
				let totalReps = 0;
				let totalVolume = 0;
				const weightUnit: WeightUnit = exercise.sets[0].weightUnit;
				for (const set of exercise.sets) {
					if (set.weight && set.weight > maxWeight) {
						maxWeight = set.weight;
					}
					totalReps += set.reps;
					totalVolume += set.reps * (set.weight || 0);
				}

				summaries[exercise.name] = {
					name: exercise.name,
					maxWeight,
					totalReps,
					totalVolume,
					weightUnit,
				};
			}

			return summaries;
		};

		const lastWorkoutExercises = getExerciseSummaries(lastWorkout);
		const previousWorkoutExercises = getExerciseSummaries(previousWorkout);

		// Calculate changes between workouts
		if (previousWorkout) {
			for (const [name, summary] of Object.entries(lastWorkoutExercises)) {
				if (previousWorkoutExercises[name]) {
					summary.change = {
						weight:
							summary.maxWeight - previousWorkoutExercises[name].maxWeight,
						reps: summary.totalReps - previousWorkoutExercises[name].totalReps,
						volume:
							summary.totalVolume - previousWorkoutExercises[name].totalVolume,
					};
				}
			}
		}

		// Helper function to get user initials
		const getUserInitials = (name: string | null | undefined): string => {
			if (!name) return "??";
			return name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase();
		};

		return (
			<div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
					<Button variant="outline" size="sm" asChild className="group">
						<Link href={`/admin/workouts/${userId}`}>
							<ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
							<span className="text-sm">Back to User Workouts</span>
						</Link>
					</Button>
					{lastWorkout && (
						<Button variant="default" size="sm" asChild className="text-sm">
							<Link href={`/workout/${lastWorkout.id}`}>
								View Latest Workout
							</Link>
						</Button>
					)}
				</div>

				{/* User info card */}
				<Card className="border-t-4 border-t-primary">
					<CardHeader className="sm:px-6 px-4 py-4 sm:py-5">
						<div className="flex items-center gap-4">
							<Avatar className="h-14 w-14 border-2 border-primary">
								<AvatarImage
									src={level.user.image ?? undefined}
									alt={level.user.name ?? "User"}
								/>
								<AvatarFallback>
									{getUserInitials(level.user.name)}
								</AvatarFallback>
							</Avatar>
							<div>
								<CardTitle className="text-2xl">{level.user.name}</CardTitle>
								<CardDescription>{level.user.email}</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
					<div className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6">
						<Card className="border-t-4 border-t-primary">
							<CardHeader className="sm:px-6 px-4 py-4 sm:py-5">
								<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
									<div>
										<CardTitle className="text-xl sm:text-2xl flex items-center gap-1.5 sm:gap-2">
											<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
											{workoutDay.name}
										</CardTitle>
										<CardDescription className="mt-1">
											Level:{" "}
											<Badge
												variant="outline"
												className="ml-1 text-xs sm:text-sm"
											>
												{level.name}
											</Badge>
										</CardDescription>
										{workoutDay.description && (
											<p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md">
												{workoutDay.description}
											</p>
										)}
									</div>

									<div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2 mt-2 sm:mt-0">
										{lastWorkoutDate && (
											<span className="text-xs sm:text-sm text-muted-foreground flex items-center">
												<CalendarClock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
												Last workout:{" "}
												{formatDistance(lastWorkoutDate, new Date(), {
													addSuffix: true,
												})}
											</span>
										)}
										<span className="text-xs sm:text-sm text-muted-foreground flex items-center">
											<Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
											{stats.workoutsForThisDay} total workouts for this day
										</span>
									</div>
								</div>
							</CardHeader>
						</Card>

						{/* User Stats */}
						<Card>
							<CardHeader className="pb-1 sm:pb-2 sm:px-6 px-4 py-4 sm:py-5">
								<CardTitle className="text-base sm:text-lg flex items-center">
									<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary" />
									Overall Stats
								</CardTitle>
							</CardHeader>
							<CardContent className="sm:px-6 px-4 pt-0 pb-4 sm:pb-5">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="bg-muted/20 p-4 rounded-lg">
										<h3 className="text-sm text-muted-foreground">
											Total Workouts
										</h3>
										<p className="text-2xl font-bold mt-1">
											{stats.totalWorkouts}
										</p>
									</div>
									<div className="bg-muted/20 p-4 rounded-lg">
										<h3 className="text-sm text-muted-foreground">
											Total Exercises
										</h3>
										<p className="text-2xl font-bold mt-1">
											{stats.totalExercises}
										</p>
									</div>
									<div className="bg-muted/20 p-4 rounded-lg">
										<h3 className="text-sm text-muted-foreground">
											Total Sets
										</h3>
										<p className="text-2xl font-bold mt-1">
											{stats.totalSets}
										</p>
									</div>
									<div className="bg-muted/20 p-4 rounded-lg">
										<h3 className="text-sm text-muted-foreground">
											{workoutDay.name} Workouts
										</h3>
										<p className="text-2xl font-bold mt-1">
											{stats.workoutsForThisDay}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Workout Comparison */}
						{lastWorkout && (
							<Card>
								<CardHeader className="pb-1 sm:pb-2 sm:px-6 px-4 py-4 sm:py-5">
									<CardTitle className="text-base sm:text-lg flex items-center">
										<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary" />
										Last Workout Comparison
									</CardTitle>
									<CardDescription className="text-xs sm:text-sm">
										{previousWorkout
											? `Comparing ${format(new Date(lastWorkout.date), "MMM d")} vs ${format(new Date(previousWorkout.date), "MMM d")}`
											: `Most recent ${workoutDay.name} on ${format(new Date(lastWorkout.date), "MMM d, yyyy")}`}
									</CardDescription>
								</CardHeader>
								<CardContent className="sm:px-6 px-4 pt-0 pb-4 sm:pb-5">
									<div className="grid grid-cols-1 gap-3 sm:gap-4">
										{Object.values(lastWorkoutExercises).map((exercise) => (
											<div
												key={exercise.name}
												className="border rounded-lg p-3 sm:p-4 hover:bg-muted/10 transition-colors"
											>
												<h4 className="font-medium text-sm sm:text-base mb-2.5">
													{exercise.name}
												</h4>
												<div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
													<div className="bg-muted/20 p-2 rounded-md">
														<div className="text-muted-foreground mb-1">
															Max Weight
														</div>
														<div className="flex items-center">
															{exercise.maxWeight} {exercise.weightUnit}
															{exercise.change && (
																<span className="ml-1">
																	<ChangeIndicator
																		value={exercise.change.weight}
																	/>
																</span>
															)}
														</div>
													</div>

													<div className="bg-muted/20 p-2 rounded-md">
														<div className="text-muted-foreground mb-1">
															Total Reps
														</div>
														<div className="flex items-center">
															{exercise.totalReps}
															{exercise.change && (
																<span className="ml-1">
																	<ChangeIndicator
																		value={exercise.change.reps}
																	/>
																</span>
															)}
														</div>
													</div>

													<div className="bg-muted/20 p-2 rounded-md">
														<div className="text-muted-foreground mb-1">
															Volume
														</div>
														<div className="flex items-center">
															{exercise.totalVolume} {exercise.weightUnit}
															{exercise.change && (
																<span className="ml-1">
																	<ChangeIndicator
																		value={exercise.change.volume}
																	/>
																</span>
															)}
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Progress Charts */}
						<Card>
							<CardHeader className="pb-1 sm:pb-2 sm:px-6 px-4 py-4 sm:py-5">
								<CardTitle className="text-base sm:text-lg flex items-center">
									<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary" />
									Exercise Progress
								</CardTitle>
								<CardDescription className="text-xs sm:text-sm">
									Progress tracking for this workout day
								</CardDescription>
							</CardHeader>
							<CardContent className="sm:px-6 px-4 pt-0 pb-4 sm:pb-5">
								{Array.from(allExercises).length > 0 ? (
									<div className="space-y-4 sm:space-y-6">
										<div className="bg-muted/20 p-3 sm:p-4 rounded-lg w-full">
											<h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4">
												All Exercises Progress
											</h3>
											<div className="h-[300px] sm:h-[350px] md:h-[450px] w-full">
												<ExerciseProgressChart
													exerciseNames={Array.from(allExercises)}
													exerciseProgressData={Object.entries(exerciseProgress).reduce((acc, [name, data]) => {
														// Get weightUnit for this exercise from lastWorkoutExercises if available
														const unit = lastWorkoutExercises[name]?.weightUnit || "kg";
														// Add weightUnit to each data point
														acc[name] = data.map(point => ({ ...point, weightUnit: unit }));
														return acc;
													}, {} as Record<string, typeof exerciseProgress[string]>)}
													showMultipleExercises={true}
												/>
											</div>
										</div>
									</div>
								) : (
									<div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
										No exercise data available yet
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<div className="lg:col-span-4 xl:col-span-3 space-y-4 sm:space-y-6">
						<Card>
							<CardHeader className="sm:px-6 px-4 py-4 sm:py-5">
								<CardTitle className="text-base sm:text-lg flex items-center">
									<Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary" />
									Workout Day Info
								</CardTitle>
							</CardHeader>
							<CardContent className="sm:px-6 px-4 pt-0 pb-4 sm:pb-5 space-y-3 sm:space-y-4">
								<div>
									<h3 className="text-xs sm:text-sm font-semibold">
										Day Number
									</h3>
									<p className="text-xs sm:text-sm text-muted-foreground mt-1">
										Day {workoutDay.dayNumber} of {level.daysPerWeek}
									</p>
								</div>

								<div>
									<h3 className="text-xs sm:text-sm font-semibold">
										Common Exercises
									</h3>
									<div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
										{Array.from(allExercises)
											.slice(0, 5)
											.map((exercise) => (
												<Badge
													key={exercise}
													variant="outline"
													className="text-[10px] sm:text-xs"
												>
													{exercise}
												</Badge>
											))}
										{allExercises.size > 5 && (
											<Badge
												variant="outline"
												className="text-[10px] sm:text-xs"
											>
												+{allExercises.size - 5} more
											</Badge>
										)}
									</div>
								</div>

								<div>
									<h3 className="text-xs sm:text-sm font-semibold">
										Recent Workouts
									</h3>
									<div className="space-y-1.5 sm:space-y-2 mt-1.5 sm:mt-2">
										{workouts
											.slice(-5)
											.reverse()
											.map((workout) => (
												<div
													key={workout.id}
													className="flex justify-between items-center text-xs sm:text-sm p-1.5 sm:p-2 border rounded-md"
												>
													<span>
														{format(new Date(workout.date), "MMM d, yyyy")}
													</span>
													<Button
														variant="ghost"
														size="sm"
														className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
														asChild
													>
														<Link href={`/workout/${workout.id}`}>View</Link>
													</Button>
												</div>
											))}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* User Activity Card */}
						<Card>
							<CardHeader className="sm:px-6 px-4 py-4 sm:py-5">
								<CardTitle className="text-base sm:text-lg flex items-center">
									<Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary" />
									User Activity
								</CardTitle>
							</CardHeader>
							<CardContent className="sm:px-6 px-4 pt-0 pb-4 sm:pb-5">
								<div className="space-y-3">
									{workouts.length > 0 ? (
										<>
											<div className="flex items-center justify-between">
												<span className="text-sm">First Workout:</span>
												<span className="text-sm font-medium">
													{format(new Date(workouts[0].date), "MMM d, yyyy")}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm">Last Workout:</span>
												<span className="text-sm font-medium">
													{format(
														new Date(workouts[workouts.length - 1].date),
														"MMM d, yyyy",
													)}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm">
													Avg. Time Between Workouts:
												</span>
												<span className="text-sm font-medium">
													{workouts.length > 1
														? calculateAverageTimeBetween(workouts)
														: "N/A"}
												</span>
											</div>
										</>
									) : (
										<p className="text-sm text-muted-foreground">
											No workout data available yet.
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error in admin workout day page:", error);
		notFound();
	}
}

// Helper component to show change indicators
function ChangeIndicator({ value }: { value: number }) {
	if (value > 0) {
		return <ArrowUp className="h-3 w-3 text-green-500" />;
	}
	if (value < 0) {
		return <ArrowDown className="h-3 w-3 text-red-500" />;
	}
	return <Minus className="h-3 w-3 text-gray-400" />;
}

// Function to calculate average time between workouts in days
function calculateAverageTimeBetween(workouts: Array<{ date: Date | string }>): string {
	if (workouts.length <= 1) return "N/A";
	
	let totalDays = 0;
	
	for (let i = 1; i < workouts.length; i++) {
		const current = new Date(workouts[i].date);
		const previous = new Date(workouts[i-1].date);
		const diffTime = Math.abs(current.getTime() - previous.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		totalDays += diffDays;
	}
	
	const average = totalDays / (workouts.length - 1);
	return `${average.toFixed(1)} days`;
}