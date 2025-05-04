"use client";

import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Workout {
	id: string;
	date: Date;
}

export function WeeklyProgress({ workouts }: { workouts: Workout[] }) {
	const today = new Date();
	const weekStart = startOfWeek(today);
	const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

	const workoutMap = new Map<string, boolean>();
	for (const workout of workouts) {
		const dateStr = format(new Date(workout.date), "yyyy-MM-dd");
		workoutMap.set(dateStr, true);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Weekly Progress</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-7 gap-1 sm:gap-2">
					{weekDays.map((day) => {
						const dateStr = format(day, "yyyy-MM-dd");
						const hasWorkout = workoutMap.has(dateStr);
						const isToday = format(today, "yyyy-MM-dd") === dateStr;
						const isPast = day < today;

						return (
							<div key={dateStr} className="flex flex-col items-center">
								<div className="flex flex-col items-center w-full">
									<span className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1">
										{format(day, "EEE")}
									</span>
									<div
										className={`
                      w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative
                      ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}
                      ${
												hasWorkout
													? "bg-primary text-primary-foreground shadow-md"
													: isPast
														? "bg-muted text-muted-foreground"
														: "bg-background text-foreground border border-border"
											}
                      transition-all duration-200 transform hover:scale-110
                    `}
									>
										<span
											className={`text-xs sm:text-sm font-bold ${
												hasWorkout ? "text-primary-foreground" : ""
											}`}
										>
											{format(day, "d")}
										</span>
										{hasWorkout && (
											<div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
												<div className="w-1.5 h-1.5 rounded-full bg-green-500" />
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className="mt-4 sm:mt-6 pt-4 border-t">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex items-center">
								<div className="w-3 h-3 bg-primary rounded-full mr-2" />
								<span className="text-sm text-muted-foreground">
									Workout Done
								</span>
							</div>
							<div className="flex items-center">
								<div className="w-3 h-3 bg-muted rounded-full mr-2" />
								<span className="text-sm text-muted-foreground">
									No Workout
								</span>
							</div>
						</div>

						<div className="text-right">
							<p className="text-sm text-muted-foreground">Progress</p>
							<p className="text-xl font-bold">
								{workouts.length}/{weekDays.length} days
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
