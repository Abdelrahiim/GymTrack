"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { ExerciseForm } from "@/components/workout/ExerciseForm";
import { WorkoutDetails } from "@/components/workout/WorkoutDetails";
import { WorkoutActions } from "@/components/workout/WorkoutActions";
import { Button } from "@/components/ui/button";
import { createWorkout } from "@/actions/workouts";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const workoutSchema = z.object({
  date: z.string(),
  name: z.string().optional(),
  exercises: z.array(
    z.object({
      name: z.string().min(1, { message: "Exercise name is required" }),
      sets: z.array(
        z.object({
          reps: z.number().min(0),
          weight: z.number().min(0),
        })
      ),
    })
  ),
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

interface ExerciseInput {
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
  }>;
}

export function NewWorkoutForm() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: "", sets: [{ reps: 0, weight: 0 }] },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: new Date().toISOString().substring(0, 10),
      name: "",
      exercises: [{ name: "", sets: [{ reps: 0, weight: 0 }] }],
    },
  });

  const addExercise = () => {
    const newExercises = [
      ...exercises,
      { name: "", sets: [{ reps: 0, weight: 0 }] },
    ];
    setExercises(newExercises);
    form.setValue("exercises", newExercises);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({ reps: 0, weight: 0 });
    setExercises(updatedExercises);
    form.setValue("exercises", updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    if (exercises.length > 1) {
      const updatedExercises = exercises.filter(
        (_, index) => index !== exerciseIndex
      );
      setExercises(updatedExercises);
      form.setValue("exercises", updatedExercises);
    }
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (exercises[exerciseIndex].sets.length > 1) {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = updatedExercises[
        exerciseIndex
      ].sets.filter((_, index) => index !== setIndex);
      setExercises(updatedExercises);
      form.setValue("exercises", updatedExercises);
    }
  };

  const handleExerciseNameChange = (exerciseIndex: number, value: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].name = value;
    setExercises(updatedExercises);
    form.setValue(`exercises.${exerciseIndex}.name`, value);
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
    form.setValue(
      `exercises.${exerciseIndex}.sets.${setIndex}.${field}`,
      value
    );
  };

  const onSubmit = async (data: WorkoutFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await createWorkout({
        date: data.date,
        name: data.name || null,
        exercises: data.exercises,
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error creating workout:", error);
      setError("Failed to create workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
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
            <Button type="button" onClick={addExercise} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Exercise</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {exercises.map((exercise, exerciseIndex) => (
              <ExerciseForm
                key={exerciseIndex}
                exerciseIndex={exerciseIndex}
                name={exercise.name}
                sets={exercise.sets}
                onNameChange={(value) =>
                  handleExerciseNameChange(exerciseIndex, value)
                }
                onAddSet={() => addSet(exerciseIndex)}
                onRemoveSet={(setIndex) => removeSet(exerciseIndex, setIndex)}
                onSetChange={(setIndex, field, value) =>
                  handleSetChange(exerciseIndex, setIndex, field, value)
                }
                onRemove={() => removeExercise(exerciseIndex)}
                canRemove={exercises.length > 1}
              />
            ))}
          </CardContent>
        </Card>

        <WorkoutActions loading={loading} />
      </form>
    </Form>
  );
} 