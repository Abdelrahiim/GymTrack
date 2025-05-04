"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { ExerciseForm } from "@/components/workout/ExerciseForm";
import { WorkoutDetails } from "@/components/workout/WorkoutDetails";
import { WorkoutActions } from "@/components/workout/WorkoutActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorkout, updateWorkout } from "@/actions/workouts";
import { format } from "date-fns";

const workoutSchema = z.object({
	date: z.string(),
	name: z.string().optional(),
	exercises: z
		.array(
			z.object({
				id: z.string().optional(),
				name: z.string().min(1, { message: "Exercise name is required" }),
				sets: z
					.array(
						z.object({
							id: z.string().optional(),
							reps: z.number().min(0).optional(),
							weight: z.number().min(0).optional(),
						}),
					)
					.min(1, "Must have at least one set"),
			}),
		)
		.min(1, "Must have at least one exercise"),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>;

interface ExerciseStateItem {
	id?: string;
	name: string;
	sets: Array<{ id?: string; reps: number; weight: number }>;
}

export interface InitialWorkoutData {
	id: string;
	date: Date;
	name: string | null;
	exercises: Array<{
		id: string;
		name: string;
		sets: Array<{
			id: string;
			reps: number;
			weight: number | null;
		}>;
	}>;
}

// Define the payload type based on what createWorkout/updateWorkout expect
// This should match the parameters defined in those actions
type WorkoutPayload = {
	date: string;
	name: string | null;
	exercises: Array<{
		name: string;
		sets: Array<{ reps: number; weight: number }>;
	}>;
};

interface WorkoutFormProps {
	initialData?: InitialWorkoutData;
}

export function WorkoutForm({ initialData }: WorkoutFormProps) {
	const router = useRouter();
	const isEditing = !!initialData;

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<WorkoutFormValues>({
		resolver: zodResolver(workoutSchema),
		defaultValues: initialData
			? {
					date: format(new Date(initialData.date), "yyyy-MM-dd"),
					name: initialData.name ?? "",
					exercises: initialData.exercises.map((ex) => ({
						id: ex.id,
						name: ex.name,
						sets: ex.sets.map((set) => ({
							id: set.id,
							reps: set.reps,
							weight: set.weight ?? undefined,
						})),
					})),
				}
			: {
					date: new Date().toISOString().substring(0, 10),
					name: "",
					exercises: [
						{ name: "", sets: [{ reps: undefined, weight: undefined }] },
					],
				},
		mode: "onChange",
	});

	const {
		fields: exerciseFields,
		append: appendExercise,
		remove: removeExercise,
	} = useFieldArray({
		control: form.control,
		name: "exercises",
		keyName: "fieldId",
	});

	const onSubmit = async (data: WorkoutFormValues) => {
		setLoading(true);
		setError(null);

		try {
			// Prepare data structure for actions
			const workoutPayload: WorkoutPayload = {
				date: data.date,
				name: data.name || null,
				exercises: data.exercises.map((ex) => ({
					name: ex.name,
					sets: ex.sets.map((set) => ({
						// Ensure values are numbers, default to 0 if undefined/null/NaN
						reps: Number(set.reps) || 0,
						weight: Number(set.weight) || 0,
					})),
				})),
			};

			if (isEditing && initialData) {
				await updateWorkout(initialData.id, workoutPayload);
				router.push(`/workout/${initialData.id}`);
			} else {
				await createWorkout(workoutPayload);
				router.push("/");
			}
			router.refresh();
		} catch (error: unknown) {
			console.error(
				`Error ${isEditing ? "updating" : "creating"} workout:`,
				error,
			);
			// Type check before accessing error.message
			let errorMessage = `Failed to ${isEditing ? "update" : "create"} workout.`;
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 sm:space-y-6"
			>
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<WorkoutDetails control={form.control} />

				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Workout Name (Optional)</FormLabel>
							<FormControl>
								<Input placeholder="e.g., Chest Day, Leg Workout" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Exercises</CardTitle>
						<Button
							type="button"
							onClick={() =>
								appendExercise({
									name: "",
									sets: [{ reps: undefined, weight: undefined }],
								})
							}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							<span className="hidden sm:inline">Add Exercise</span>
							<span className="sm:hidden">Add</span>
						</Button>
					</CardHeader>
					<CardContent className="space-y-4 sm:space-y-6">
						{exerciseFields.map((exerciseField, exerciseIndex) => (
							<ExerciseForm
								key={exerciseField.fieldId}
								control={form.control}
								register={form.register}
								exerciseIndex={exerciseIndex}
								removeExercise={removeExercise}
								canRemove={exerciseFields.length > 1}
								getValues={form.getValues}
								setValue={form.setValue}
							/>
						))}
						{form.formState.errors.exercises?.root?.message && (
							<p className="text-sm font-medium text-destructive">
								{form.formState.errors.exercises.root.message}
							</p>
						)}
					</CardContent>
				</Card>

				<WorkoutActions
					loading={loading}
					cancelHref={
						isEditing && initialData ? `/workout/${initialData.id}` : "/"
					}
					submitText={isEditing ? "Update Workout" : "Log Workout"}
				/>
			</form>
		</Form>
	);
}
