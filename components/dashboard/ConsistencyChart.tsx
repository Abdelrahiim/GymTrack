"use client";

import { useMemo } from "react";
import {
	subDays,
	format,
	eachDayOfInterval,
	isSameDay,
	isAfter,
	isBefore,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";

interface Workout {
	id: string;
	date: Date;
	name: string | null;
	workoutDay?: { name: string } | null;
	exercises: Array<{ name: string }>;
}

interface ChartDataPoint {
	date: string;
	value: number;
	fullDate: string;
	workoutName: string | null;
	exerciseCount: number;
	workoutId: string | null;
	isPast: boolean;
	isFuture: boolean;
}

interface ConsistencyChartProps {
	workouts: Workout[];
	daysToShow?: number;
}

export function ConsistencyChart({
	workouts,
	daysToShow = 28,
}: ConsistencyChartProps) {
	const chartData = useMemo(() => {
		const today = new Date();
		const startDate = subDays(today, daysToShow - 1);

		// Get all days in the interval
		const days = eachDayOfInterval({
			start: startDate,
			end: today,
		});

		// Create a map of workout days with workout details
		const workoutsByDate = new Map();
		for (const workout of workouts) {
			const date = new Date(workout.date);
			const dateStr = format(date, "yyyy-MM-dd");

			// If multiple workouts on same day, keep the most recent one
			if (
				!workoutsByDate.has(dateStr) ||
				new Date(workoutsByDate.get(dateStr).date) < date
			) {
				workoutsByDate.set(dateStr, workout);
			}
		}

		// Create chart data points
		return days.map((day) => {
			const dateStr = format(day, "yyyy-MM-dd");
			const workout = workoutsByDate.get(dateStr);
			const hasWorkout = !!workout;
			const isPast = isBefore(day, today);
			const isFuture = isAfter(day, today);
			const isToday = isSameDay(day, today);

			return {
				date: format(day, "MMM dd"),
				value: hasWorkout ? 1 : 0,
				fullDate: dateStr,
				workoutName: hasWorkout
					? workout.name || workout.workoutDay?.name || "Unnamed Workout"
					: null,
				exerciseCount: hasWorkout ? workout.exercises.length : 0,
				workoutId: hasWorkout ? workout.id : null,
				isPast,
				isFuture,
				isToday,
			};
		});
	}, [workouts, daysToShow]);

	// Calculate stats
	const completedWorkouts = chartData.filter((d) => d.value > 0);
	const workoutCompletionRate =
		chartData.filter((d) => d.isPast || d.isToday).length > 0
			? Math.round(
					(completedWorkouts.length /
						chartData.filter((d) => d.isPast || d.isToday).length) *
						100,
				)
			: 0;

	// Custom tooltip formatter
	const renderTooltipContent = (props: TooltipProps<number, string>) => {
		const { active, payload, label } = props;

		if (!active || !payload || !payload.length) {
			return null;
		}

		const data = payload[0].payload as ChartDataPoint;

		return (
			<div className="bg-background text-foreground p-2 rounded-md border border-border shadow-md">
				<p className="text-xs mb-1">{`Date: ${label}`}</p>
				{data.value ? (
					<>
						<p className="font-medium">{data.workoutName}</p>
						<p className="text-xs text-muted-foreground">
							{data.exerciseCount} exercises
						</p>
					</>
				) : data.isPast ? (
					<p className="text-sm">No workout</p>
				) : (
					<p className="text-sm">Future day</p>
				)}
			</div>
		);
	};

	// Custom bar fill color based on data
	const getBarColor = (entry: ChartDataPoint) => {
		// We show a bar only for completed workouts
		if (entry.value > 0) {
			return "#4f46e5"; // Primary color for completed workouts
		}
		return "rgba(0,0,0,0)"; // Transparent for days without workouts
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2">
					<CalendarDays className="h-5 w-5 text-primary" />
					Training Consistency
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[200px]">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={chartData}>
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tick={{ fontSize: 10 }}
								interval="preserveStartEnd"
							/>
							<YAxis hide domain={[0, 1]} />
							<Tooltip content={renderTooltipContent} />
							<Bar
								dataKey="value"
								fill="#4f46e5"
								radius={[4, 4, 0, 0]}
								barSize={16}
								name="Workout"
							/>
							{/* Custom bar coloring */}
							<defs>
								<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#4f46e5" stopOpacity={0.6} />
								</linearGradient>
							</defs>
						</BarChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-4 pt-4 border-t">
					<div className="flex justify-between items-center">
						<span className="text-sm text-muted-foreground">
							Past {daysToShow} days
						</span>
						<div className="text-right">
							<div className="text-sm text-muted-foreground">
								Completion rate
							</div>
							<div className="font-medium">
								{workoutCompletionRate}% ({completedWorkouts.length} workouts)
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
