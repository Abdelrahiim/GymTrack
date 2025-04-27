"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createWorkout } from "@/app/actions/workouts";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const addExercise = () => {
    const newExercises = [...exercises, { name: "", sets: [{ reps: 0, weight: 0 }] }];
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
      const updatedExercises = exercises.filter((_, index) => index !== exerciseIndex);
      setExercises(updatedExercises);
      form.setValue("exercises", updatedExercises);
    }
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (exercises[exerciseIndex].sets.length > 1) {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter(
        (_, index) => index !== setIndex
      );
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
    form.setValue(`exercises.${exerciseIndex}.sets.${setIndex}.${field}`, value);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Log New Workout</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200">
          {error && (
            <div className="p-4 sm:p-5 bg-red-50 border-b border-red-100 text-red-700 rounded-t-xl">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-8">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel className="text-sm font-medium text-gray-700">Workout Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="w-full max-w-sm"
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("date", e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Exercises</h2>
                <Button
                  type="button"
                  onClick={addExercise}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 h-auto flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Exercise
                </Button>
              </div>

              <div className="space-y-6">
                {exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={exerciseIndex}
                    className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-sm transition-all bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <Input
                        type="text"
                        placeholder="Exercise Name"
                        value={exercise.name}
                        onChange={(e) => handleExerciseNameChange(exerciseIndex, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeExercise(exerciseIndex)}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">Sets</h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addSet(exerciseIndex)}
                          className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-lg hover:bg-gray-300 transition-colors flex items-center h-auto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Set
                        </Button>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <th className="px-4 sm:px-6 py-3">Set</th>
                              <th className="px-4 sm:px-6 py-3">Reps</th>
                              <th className="px-4 sm:px-6 py-3">Weight (kg)</th>
                              <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {exercise.sets.map((set, setIndex) => (
                              <tr key={setIndex} className="text-gray-800">
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium">
                                  {setIndex + 1}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={set.reps}
                                    onChange={(e) =>
                                      handleSetChange(
                                        exerciseIndex,
                                        setIndex,
                                        "reps",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 sm:w-20"
                                    required
                                  />
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={set.weight}
                                    onChange={(e) =>
                                      handleSetChange(
                                        exerciseIndex,
                                        setIndex,
                                        "weight",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 sm:w-20"
                                    required
                                  />
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeSet(exerciseIndex, setIndex)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded-full"
                                    disabled={exercise.sets.length <= 1}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
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
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Workout"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 