"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Dumbbell } from "lucide-react";
import { WeightUnit } from "@/lib/generated/prisma/client";

interface Set {
	id: string;
	reps: number;
	weight: number | null;
	weightUnit?: WeightUnit;
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

interface WorkoutCardProps {
	workout: {
		id: string;
		date: string;
		name: string | null;
		level?: {
			name: string;
			id: string;
		} | null;
		workoutDay?: {
			name: string;
			id: string;
		} | null;
		exercises: Array<{
			name: string;
			sets: Array<{
				id?: string;
				reps: number;
				weight: number;
				weightUnit?: WeightUnit;
			}>;
		}>;
	};
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
	const totalExercises = workout.exercises.length;
	const totalSets = workout.exercises.reduce(
		(count, exercise) => count + exercise.sets.length,
		0,
	);

	const formatExerciseWeights = (
		sets: Array<{ weight: number; weightUnit?: WeightUnit }>,
	): string => {
		const weights = sets.filter((s) => s.weight > 0);
		if (weights.length === 0) return "Bodyweight";

		const uniqueEntries = Array.from(
			new Map(
				weights.map((s) => [`${s.weight}-${s.weightUnit || "KG"}`, s]),
			).values(),
		);

		uniqueEntries.sort((a, b) => (a.weight || 0) - (b.weight || 0));

		return uniqueEntries
			.map((s) => {
				const unit = s.weightUnit || WeightUnit.KG;
				switch (unit) {
					case WeightUnit.KG:
					case WeightUnit.LB:
						return `${s.weight}${unit.toLowerCase()}`;
					case WeightUnit.PLATES:
						return `${s.weight} Plate${s.weight === 1 ? "" : "s"}`;
					default:
						return `${s.weight}kg`;
				}
			})
			.join(" / ");
	};

	return (
		<Card className="hover:shadow-md transition-all duration-300">
			<CardHeader className="pb-2">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
					<div>
						{workout.name && (
							<CardTitle className="text-xl mb-1">{workout.name}</CardTitle>
						)}
						<p className="text-sm text-muted-foreground">
							{format(new Date(workout.date), "EEEE, MMMM d, yyyy")}
						</p>
						{workout.workoutDay && (
							<Badge variant="outline" className="mt-1">
								{workout.workoutDay.name}
							</Badge>
						)}
						{workout.level && (
							<Badge variant="secondary" className="mt-1 ml-2">
								{workout.level.name}
							</Badge>
						)}
					</div>
					<Button
						asChild
						variant="default"
						size="sm"
						className="w-full sm:w-auto"
					>
						<Link href={`/workout/${workout.id}`}>
							View Details
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						<Dumbbell className="h-4 w-4" />
						<span>{totalExercises} exercises</span>
					</div>
					<div className="flex items-center gap-1">
						<span>{totalSets} sets</span>
					</div>
				</div>

				<div className="mt-4 space-y-2">
					{workout.exercises.slice(0, 3).map((exercise) => (
						<div
							key={exercise.name}
							className="flex items-center justify-between text-sm gap-2"
						>
							<span className="font-medium truncate pr-1">{exercise.name}</span>
							<span className="text-muted-foreground whitespace-nowrap text-right">
								{exercise.sets.length}{" "}
								{exercise.sets.length === 1 ? "set" : "sets"},{" "}
								{formatExerciseWeights(exercise.sets)}
							</span>
						</div>
					))}
					{workout.exercises.length > 3 && (
						<div className="text-sm text-muted-foreground">
							+{workout.exercises.length - 3} more exercises
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
