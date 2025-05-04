"use client";

import { useEffect, useRef } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

interface Workout {
	id: string;
	createdAt: Date;
	exercises: {
		sets: {
			weight: number | null;
			reps: number;
		}[];
	}[];
}

interface WorkoutProgressChartProps {
	workouts: Workout[];
}

export function WorkoutProgressChart({ workouts }: WorkoutProgressChartProps) {
	const chartRef = useRef<HTMLDivElement>(null);

	// Process workout data for the chart
	const chartData = workouts
		.map((workout) => {
			const totalVolume = workout.exercises.reduce((acc, exercise) => {
				return (
					acc +
					exercise.sets.reduce(
						(acc, set) => acc + (set.weight || 0) * set.reps,
						0,
					)
				);
			}, 0);

			return {
				date: new Date(workout.createdAt).toLocaleDateString(),
				volume: totalVolume,
			};
		})
		.reverse(); // Reverse to show oldest to newest

	return (
		<div ref={chartRef} className="h-[300px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Line
						type="monotone"
						dataKey="volume"
						stroke="#8884d8"
						activeDot={{ r: 8 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
