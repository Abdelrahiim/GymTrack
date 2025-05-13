import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWorkouts, getDistinctWorkoutNames } from "@/actions/workouts";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, BarChart3, Award, Dumbbell } from "lucide-react";
import Link from "next/link";
import { WorkoutFilter } from "@/components/dashboard/WorkoutFilter";
import { format } from "date-fns";

interface WorkoutPageSearchParams {
	search?: string;
	page?: string;
	name?: string;
}

export default async function WorkoutsPage({
	searchParams,
}: {
	searchParams: Promise<WorkoutPageSearchParams>;
}) {
	const session = await auth();

	if (!session) {
		redirect("/auth/signin");
	}

	const { search, page: pageParam, name } = await Promise.resolve(searchParams);
	const currentPage = Number(pageParam) || 1;
	const currentSearch = search || "";
	const currentFilter = name || "";

	const distinctNames = await getDistinctWorkoutNames();

	const { workouts, total, totalPages } = await getWorkouts({
		search: currentSearch,
		page: currentPage,
		limit: 10,
		name: currentFilter,
	});

	const buildUrlQuery = (newPage?: number): string => {
		const params = new URLSearchParams();
		if (newPage && newPage > 1) params.set("page", String(newPage));
		if (currentSearch) params.set("search", currentSearch);
		if (currentFilter) params.set("name", currentFilter);
		const queryString = params.toString();
		return queryString ? `?${queryString}` : "";
	};

	return (
		<div className="container mx-auto py-6 space-y-6">
			<Card>
				<CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<CardTitle>
						{currentFilter ? `${currentFilter} Workouts` : "All Workouts"}
					</CardTitle>
					<WorkoutFilter
						distinctNames={distinctNames}
						currentFilter={currentFilter}
					/>
				</CardHeader>
				<CardContent>
					<form className="flex flex-col sm:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search workouts..."
								className="pl-9"
								defaultValue={currentSearch}
								name="search"
							/>
						</div>
						<Button type="submit">Search</Button>
					</form>

					{/* If user has any workouts with level and workout day info, show quick links */}
					{workouts.some(w => w.workoutDay?.level) && (
						<div className="mb-6 bg-accent/30 p-4 rounded-lg border border-border/50">
							<h3 className="text-base font-medium mb-3 flex items-center">
								<BarChart3 className="h-4 w-4 mr-2 text-primary" />
								Your Training Programs
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Track your progress for each training day in your programs
							</p>
							<div className="flex flex-wrap gap-4">
								{Array.from(new Set(workouts
									.filter(w => w.workoutDay?.level)
									.map(w => w.workoutDay?.level?.name)))
									.map(levelName => (
										<div key={levelName} className="space-y-2 bg-background rounded-md p-3 border flex-1 min-w-[200px]">
											<h4 className="text-sm font-medium text-foreground flex items-center">
												<Award className="h-4 w-4 mr-2 text-primary" />
												{levelName}
											</h4>
											<div className="flex flex-wrap gap-2 mt-3">
												{Array.from(new Set(workouts
													.filter(w => w.workoutDay?.level?.name === levelName)
													.map(w => w.workoutDay?.name)))
													.filter(Boolean)
													.map(dayName => (
														<Button key={dayName} variant="outline" size="sm" asChild className="h-8 text-xs px-3 hover:bg-primary/10 hover:text-primary">
															<Link href={`/levels/${encodeURIComponent(levelName || '')}/${encodeURIComponent(dayName || '')}`} className="flex items-center">
																<Dumbbell className="h-3 w-3 mr-1" />
																{dayName}
															</Link>
														</Button>
													))}
											</div>
										</div>
									))}
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{workouts.map((workout) => (
							<WorkoutCard
								key={workout.id}
								workout={{
									id: workout.id,
									date: format(new Date(workout.date), "yyyy-MM-dd"),
									name: workout.name,
									level: workout.workoutDay?.level ? {
										id: workout.workoutDay.level.id,
										name: workout.workoutDay.level.name,
									} : null,
									workoutDay: workout.workoutDay ? {
										id: workout.workoutDay.id,
										name: workout.workoutDay.name,
									} : null,
									exercises: workout.exercises.map((ex) => ({
										name: ex.name,
										sets: ex.sets.map((set) => ({
											id: set.id,
											reps: set.reps,
											weight: set.weight ?? 0,
										})),
									})),
								}}
							/>
						))}
					</div>

					{workouts.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							{currentFilter
								? `No '${currentFilter}' workouts found`
								: "No workouts found"}
						</div>
					)}

					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 mt-6">
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage <= 1}
								asChild
							>
								<Link href={`/workout${buildUrlQuery(currentPage - 1)}`}>
									<ChevronLeft className="h-4 w-4 mr-2" />
									Previous
								</Link>
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage >= totalPages}
								asChild
							>
								<Link href={`/workout${buildUrlQuery(currentPage + 1)}`}>
									Next
									<ChevronRight className="h-4 w-4 ml-2" />
								</Link>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
