import { Suspense } from "react";
import { getUserLevelInfo } from "@/actions/dashboard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
	CalendarDays,
	ChevronRight,
	Dumbbell,
	LineChart,
	Medal,
	Star,
	TrendingUp,
	Flame,
	Award,
	BarChart3,
} from "lucide-react";
import {
	formatDistanceToNow,
	format,
	isSameDay,
	startOfWeek,
	addDays,
} from "date-fns";
import { ConsistencyChart } from "@/components/dashboard/ConsistencyChart";
import { TrainingDaysInfo } from "@/components/dashboard/TrainingDaysInfo";

// Define the necessary types
interface WorkoutSet {
	id?: string;
	reps: number;
	weight: number;
	weightUnit?: string;
}

interface WorkoutExercise {
	name: string;
	sets: WorkoutSet[];
}

interface WorkoutDay {
	id: string;
	name: string;
	dayNumber: number;
	level?: {
		id: string;
		name: string;
	} | null;
}

interface Workout {
	id: string;
	date: Date | string;
	name: string | null;
	workoutDay?: WorkoutDay | null;
	exercises: WorkoutExercise[];
}

export default async function Dashboard() {
	const dashboardData = await getUserLevelInfo();
	const { user, currentLevel, allLevels, recentWorkouts, weekProgress, stats } =
		dashboardData;

	// Calculate week progress
	const today = new Date();
	const weekStart = startOfWeek(today);

	// Map workouts by day of the week for this week
	const workoutsThisWeek = recentWorkouts.filter((workout) => {
		const workoutDate = new Date(workout.date);
		return workoutDate >= weekStart && workoutDate <= today;
	});

	// Calculate week progress percentage based on completed days this week vs. typical days per week
	const completedDaysThisWeek = workoutsThisWeek.length;
	const progressPercentage = currentLevel?.daysPerWeek
		? Math.round((completedDaysThisWeek / currentLevel.daysPerWeek) * 100)
		: 0;

	// Get today's workout (if completed)
	const todayWorkout = recentWorkouts.find((workout) =>
		isSameDay(new Date(workout.date), today),
	);

	// Get workout patterns for each weekday
	const workoutPatternsByDay = new Map();
	
	// Look at past workouts to find patterns by day of week
	for (const workout of recentWorkouts) {
		const workoutDate = new Date(workout.date);
		const dayOfWeek = workoutDate.getDay(); // 0-6 (Sunday-Saturday)
		
		// Store the most recent workout for each day of week
		const existingWorkout = workoutPatternsByDay.get(dayOfWeek);
		if (!existingWorkout || workoutDate > new Date(existingWorkout.date)) {
			workoutPatternsByDay.set(dayOfWeek, workout);
		}
	}

	return (
		<div className="container mx-auto py-6 px-4 space-y-8">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-start gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Hello, {user.name || "Athlete"}
					</h1>
					<p className="text-muted-foreground">
						Track your training progress and stay consistent
					</p>
				</div>

				<div className="flex gap-2">
					<Button asChild>
						<Link href="/workout/new">Log Workout</Link>
					</Button>
				</div>
			</div>

			{/* Level Information */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="md:col-span-2">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2">
							<Medal className="h-5 w-5 text-primary" />
							{currentLevel ? "Current Level" : "Training Status"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{currentLevel ? (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-xl font-semibold">
											{currentLevel.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											{currentLevel.description || "No description"}
										</p>
									</div>
									<Badge variant="outline">
										{currentLevel.daysPerWeek} days/week
									</Badge>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span>This week's progress</span>
										<span className="font-medium">
											{completedDaysThisWeek}/{currentLevel.daysPerWeek} days
										</span>
									</div>
									<Progress value={progressPercentage} className="h-2" />
								</div>

								{/* Workout Days for This Week */}
								<div className="pt-2">
									<h4 className="text-sm font-medium mb-3">
										This Week's Training
									</h4>
									<div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
										{/* Sunday to Wednesday in first row for mobile (all days in one row for larger screens) */}
										{Array.from({ length: 7 }, (_, i) => {
											const dayDate = addDays(weekStart, i);
											const isToday = isSameDay(dayDate, today);
											const isPast = dayDate < today;
											const isFuture = dayDate > today;
											const dayOfWeek = dayDate.getDay();
											
											// Find workout for this day in the current week
											const dayWorkout = recentWorkouts.find((workout) =>
												isSameDay(new Date(workout.date), dayDate),
											);
											
											// Get the pattern for this day of week from historical data
											const dayPattern = workoutPatternsByDay.get(dayOfWeek);
											
											const isCompleted = !!dayWorkout;
											const dayWorkoutName = dayWorkout 
												? (dayWorkout.name || dayWorkout.workoutDay?.name)
												: dayPattern 
													? (dayPattern.name || dayPattern.workoutDay?.name) 
													: null;
												
											const showWorkoutIcon = isCompleted;
											
											return (
												<div
													key={format(dayDate, "yyyy-MM-dd")}
													className={`p-1 text-center rounded-md ${
														isToday ? "ring-2 ring-primary ring-offset-1" : ""
													} ${
														isCompleted
															? "bg-primary/20 border border-primary/30"
															: isFuture
																? "border border-dashed border-muted"
																: isPast && dayPattern
																	? "border border-muted bg-accent/20"
																	: "border border-muted"
													}`}
												>
													<div className="font-medium text-xs">
														{format(dayDate, "EEE")}
													</div>
													<div className="text-xs mt-1">
														{format(dayDate, "d")}
													</div>
													{showWorkoutIcon && (
														<div className="mt-1">
															<Dumbbell className="h-4 w-4 mx-auto text-primary" />
														</div>
													)}
													{isCompleted && dayWorkoutName && (
														<div className="mt-1 text-xs line-clamp-1 text-muted-foreground">
															{dayWorkoutName}
														</div>
													)}
													{!isCompleted && (
														<div className="mt-1 text-xs text-muted-foreground">
															{isToday 
																? "_" 
																: isFuture
																	? "Incoming"
																	: dayWorkoutName || "Rest"}
														</div>
													)}
													{/* Add link to progress page for completed workouts */}
													{isCompleted && dayWorkout?.workoutDay?.name && (
														<Link 
															href={`/workout/${dayWorkout.id}`}
															className="mt-1 flex justify-center"
														>
															<BarChart3 className="h-3 w-3 text-primary hover:text-primary/80" />
														</Link>
													)}
												</div>
											);
										})}
									</div>
								</div>
							</div>
						) : (
							<Alert>
								<AlertTitle>No level assigned</AlertTitle>
								<AlertDescription>
									You don't have a training level assigned yet.
									{allLevels.length > 0 ? (
										<span className="ml-1">
											Please contact admin to assign a training level.
										</span>
									) : (
										<span className="ml-1">
											Please contact admin to create and assign a training level.
										</span>
									)}
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>

				{/* Today's Workout Status */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2">
							<Dumbbell className="h-5 w-5 text-primary" />
							Today's Workout
						</CardTitle>
					</CardHeader>
					<CardContent>
						{todayWorkout ? (
							<div className="space-y-4">
								<div>
									<h3 className="text-xl font-semibold">
										{todayWorkout.name ||
											todayWorkout.workoutDay?.name ||
											"Today's Workout"}
									</h3>
									<p className="text-sm text-muted-foreground">
										{`${todayWorkout.exercises.length} exercises completed`}
									</p>
								</div>

								<div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900">
									<div className="flex items-center text-green-700 dark:text-green-400">
										<Star className="h-5 w-5 mr-2" />
										<span className="font-medium">Completed</span>
									</div>
									<p className="text-sm mt-1 text-green-700/80 dark:text-green-400/80">
										Great job! You've completed today's workout.
									</p>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div className="text-center py-4">
									<CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
									<h3 className="text-lg font-medium mb-1">No Workout Yet</h3>
									<p className="text-sm text-muted-foreground mb-4">
										You haven't logged a workout for today
									</p>
								</div>

								<Button asChild className="w-full">
									<Link href="/workout/new">Log Today's Workout</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Training Days Detail & Consistency */}
			{currentLevel && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<TrainingDaysInfo
						workoutDays={currentLevel.workoutDays}
						recentWorkouts={recentWorkouts}
						daysPerWeek={currentLevel.daysPerWeek}
					/>
					<ConsistencyChart workouts={recentWorkouts} />
				</div>
			)}

			{/* Stats & Recent Workouts */}
			<div className="grid grid-cols-1 gap-4 sm:gap-6">
				{/* Stats and Programs Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
					{/* Left Column: Stats Cards */}
					<div className="grid grid-cols-2 gap-3 sm:gap-4">
						<Card className="p-2 sm:p-4">
							<CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
								<CardTitle className="text-xs sm:text-sm font-medium">
									Workout Streak
								</CardTitle>
							</CardHeader>
							<CardContent className="p-2 sm:p-4 pt-0">
								<div className="flex justify-between items-center">
									<div className="flex items-center">
										<Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-1 sm:mr-2" />
										<span className="text-xl sm:text-2xl font-bold">
											{stats.currentStreak}
										</span>
									</div>
									<div className="text-[10px] sm:text-xs text-muted-foreground">
										<span className="font-medium">
											Best: {stats.longestStreak}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="p-2 sm:p-4">
							<CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
								<CardTitle className="text-xs sm:text-sm font-medium">
									Total Workouts
								</CardTitle>
							</CardHeader>
							<CardContent className="p-2 sm:p-4 pt-0">
								<div className="flex items-center">
									<Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-1 sm:mr-2" />
									<span className="text-xl sm:text-2xl font-bold">
										{stats.totalWorkouts}
									</span>
								</div>
							</CardContent>
						</Card>

						<Card className="p-2 sm:p-4">
							<CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
								<CardTitle className="text-xs sm:text-sm font-medium">
									Total Exercises
								</CardTitle>
							</CardHeader>
							<CardContent className="p-2 sm:p-4 pt-0">
								<div className="flex items-center">
									<LineChart className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 mr-1 sm:mr-2" />
									<span className="text-xl sm:text-2xl font-bold">
										{stats.totalExercises}
									</span>
								</div>
							</CardContent>
						</Card>

						<Card className="p-2 sm:p-4">
							<CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
								<CardTitle className="text-xs sm:text-sm font-medium">
									Total Sets
								</CardTitle>
							</CardHeader>
							<CardContent className="p-2 sm:p-4 pt-0">
								<div className="flex items-center">
									<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1 sm:mr-2" />
									<span className="text-xl sm:text-2xl font-bold">
										{stats.totalSets}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>
					
					{/* Right Column: Training Programs (if exists) */}
					{currentLevel ? (
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
									<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
									Training Programs
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<p className="text-xs sm:text-sm text-muted-foreground">
										View your progress on each training day
									</p>
									<div className="space-y-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
										{currentLevel.workoutDays.map((day) => (
											<Link
												href={`/levels/${encodeURIComponent(currentLevel.name)}/${encodeURIComponent(day.name)}`}
												key={day.id}
												className="flex items-center justify-between p-1.5 sm:p-2 rounded-md border hover:bg-accent hover:border-primary/30 transition-colors"
											>
												<div className="flex items-center">
													<Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary" />
													<span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{day.name}</span>
												</div>
												<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
											</Link>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					) : (
						// If no Training Programs, show Recent Workouts in this column on large screens
						<Card className="lg:block hidden">
							<CardHeader className="pb-2">
								<div className="flex justify-between items-center">
									<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
										<Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
										Recent Workouts
									</CardTitle>
									<Link
										href="/workout"
										className="text-xs sm:text-sm text-primary flex items-center"
									>
										View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
									</Link>
								</div>
							</CardHeader>
							<CardContent>
								{recentWorkouts.length > 0 ? (
									<div className="space-y-3 sm:space-y-4">
										{recentWorkouts.slice(0, 2).map((workout) => (
											<Link
												href={`/workout/${workout.id}`}
												key={workout.id}
												className="block"
											>
												<div className="flex justify-between items-center p-2 sm:p-3 rounded-lg border hover:bg-accent hover:border-primary/30 transition-colors">
													<div className="max-w-[70%]">
														<h3 className="font-medium text-sm sm:text-base truncate">
															{workout.name ||
																workout.workoutDay?.name ||
																"Unnamed Workout"}
														</h3>
														<div className="text-[10px] sm:text-xs text-muted-foreground flex items-center mt-1 flex-wrap">
															<CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
															{format(new Date(workout.date), "PPP")} ·{" "}
															{formatDistanceToNow(new Date(workout.date), {
																addSuffix: true,
															})}
														</div>
													</div>
													<div className="text-[10px] sm:text-xs whitespace-nowrap">
														<span className="font-medium">
															{workout.exercises.length}
														</span>{" "}
														exercises
													</div>
												</div>
											</Link>
										))}
									</div>
								) : (
									<div className="text-center py-6 sm:py-8">
										<Dumbbell className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-3" />
										<h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No workouts yet</h3>
										<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
											Start tracking your workouts to see your progress
										</p>
										<Button size="sm" asChild>
											<Link href="/workout/new">Log Your First Workout</Link>
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
					
				{/* Recent Workouts (shown on all screen sizes when Training Programs exist, and only on mobile/tablet when it doesn't) */}
				<Card className={currentLevel ? "" : "lg:hidden"}>
					<CardHeader className="pb-2">
						<div className="flex justify-between items-center">
							<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
								<Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
								Recent Workouts
							</CardTitle>
							<Link
								href="/workout"
								className="text-xs sm:text-sm text-primary flex items-center"
							>
								View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
							</Link>
						</div>
					</CardHeader>
					<CardContent>
						{recentWorkouts.length > 0 ? (
							<div className="space-y-3 sm:space-y-4">
								{recentWorkouts.slice(0, 3).map((workout) => (
									<Link
										href={`/workout/${workout.id}`}
										key={workout.id}
										className="block"
									>
										<div className="flex justify-between items-center p-2 sm:p-3 rounded-lg border hover:bg-accent hover:border-primary/30 transition-colors">
											<div className="max-w-[70%]">
												<h3 className="font-medium text-sm sm:text-base truncate">
													{workout.name ||
														workout.workoutDay?.name ||
														"Unnamed Workout"}
												</h3>
												<div className="text-[10px] sm:text-xs text-muted-foreground flex items-center mt-1 flex-wrap">
													<CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
													{format(new Date(workout.date), "PPP")} ·{" "}
													{formatDistanceToNow(new Date(workout.date), {
														addSuffix: true,
													})}
												</div>
											</div>
											<div className="text-[10px] sm:text-xs whitespace-nowrap">
												<span className="font-medium">
													{workout.exercises.length}
												</span>{" "}
												exercises
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="text-center py-6 sm:py-8">
								<Dumbbell className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-3" />
								<h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No workouts yet</h3>
								<p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
									Start tracking your workouts to see your progress
								</p>
								<Button size="sm" asChild>
									<Link href="/workout/new">Log Your First Workout</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
