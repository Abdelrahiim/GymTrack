"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createWorkout } from "@/app/actions/workouts";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { ExerciseForm } from "@/components/workout/ExerciseForm";

// Define schema for workout validation
const workoutSchema = z.object({
  date: z.string(),
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

export default function NewWorkout() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: "", sets: [{ reps: 0, weight: 0 }] },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: new Date().toISOString().substring(0, 10),
      exercises: [{ name: "", sets: [{ reps: 0, weight: 0 }] }],
    },
  });

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Log New Workout</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Exercises</CardTitle>
              <Button type="button" onClick={addExercise} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Exercise
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
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

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Workout"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
