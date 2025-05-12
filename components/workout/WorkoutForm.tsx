"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createWorkout } from "@/actions/workouts";
import { ExerciseForm } from "./ExerciseForm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { WeightUnit, type WorkoutDay } from "@/lib/generated/prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	workoutSchema,
	type WorkoutFormValues,
} from "@/lib/validations/workout";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type WorkoutFormProps = {
	workoutDays: WorkoutDay[];
};

export function WorkoutForm({ workoutDays }: WorkoutFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedWorkoutDayId, setSelectedWorkoutDayId] = useState<string>("");

	const {
		register,
		control,
		handleSubmit,
		getValues,
		setValue,
		formState: { errors },
	} = useForm<WorkoutFormValues>({
		resolver: zodResolver(workoutSchema),
		defaultValues: {
			name: "",
			exercises: [
				{
					name: "",
					sets: [{ reps: 10, weight: 0, weightUnit: WeightUnit.KG }],
				},
			],
		},
	});

	const {
		fields: exerciseFields,
		append: appendExercise,
		remove: removeExercise,
	} = useFieldArray({
		control,
		name: "exercises",
	});

	const onSubmit = async (data: WorkoutFormValues) => {
		setIsSubmitting(true);
		try {
			// Set today's date without time component
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Get the selected workout day name for the workout name
			const selectedDay = workoutDays.find(
				(day) => day.id === selectedWorkoutDayId,
			);

			// Create workout with today's date
			await createWorkout({
				date: today.toISOString(),
				name: selectedDay?.name || data.name || null,
				workoutDayId: selectedWorkoutDayId,
				exercises: data.exercises,
			});

			router.push("/workout");
			router.refresh();
		} catch (error) {
			console.error("Error submitting workout:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<Card>
				<CardContent className="pt-6">
					<div className="space-y-4">
						<div>
							<Label htmlFor="workoutDay">Workout Type</Label>
							<Select
								onValueChange={(value) => {
									setSelectedWorkoutDayId(value);
									const selectedDay = workoutDays.find(
										(day) => day.id === value,
									);
									setValue("name", selectedDay?.name || "");
								}}
								value={selectedWorkoutDayId}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a workout from your level" />
								</SelectTrigger>
								<SelectContent>
									{workoutDays.map((day) => (
										<SelectItem key={day.id} value={day.id}>
											{day.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium">Exercises</h3>
								<Button
									type="button"
									onClick={() =>
										appendExercise({
											name: "",
											sets: [
												{ reps: 10, weight: 0, weightUnit: WeightUnit.KG },
											],
										})
									}
									variant="outline"
								>
									Add Exercise
								</Button>
							</div>

							{exerciseFields.map((field, index) => (
								<div key={field.id} className="border rounded-lg p-4 space-y-4">
									<ExerciseForm
										control={control}
										register={register}
										exerciseIndex={index}
										removeExercise={removeExercise}
										canRemove={exerciseFields.length > 1}
										getValues={getValues}
										setValue={setValue}
									/>
									{errors.exercises?.[index]?.name && (
										<p className="text-sm text-destructive mt-1">
											{errors.exercises[index]?.name?.message}
										</p>
									)}
								</div>
							))}
							{errors.exercises && (
								<p className="text-sm text-destructive">
									{errors.exercises.message}
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/workout")}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : "Save Workout"}
				</Button>
			</div>
		</form>
	);
}
