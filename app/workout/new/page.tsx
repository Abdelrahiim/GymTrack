"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createWorkout } from "@/app/actions/workouts";
import Link from "next/link";

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
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setExercises([...exercises, { name: "", sets: [{ reps: 0, weight: 0 }] }]);
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({ reps: 0, weight: 0 });
    setExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    if (exercises.length > 1) {
      const updatedExercises = exercises.filter((_, index) => index !== exerciseIndex);
      setExercises(updatedExercises);
    }
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (exercises[exerciseIndex].sets.length > 1) {
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter(
        (_, index) => index !== setIndex
      );
      setExercises(updatedExercises);
    }
  };

  const handleExerciseNameChange = (exerciseIndex: number, value: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].name = value;
    setExercises(updatedExercises);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createWorkout({
        date,
        exercises,
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
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Log New Workout</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
        {error && (
          <div className="p-5 bg-red-50 border-b border-red-100 text-red-700 rounded-t-xl">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        <div className="p-8">
          <div className="mb-8">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Workout Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Exercises</h2>
              <button
                type="button"
                onClick={addExercise}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Exercise
              </button>
            </div>

            <div className="space-y-6">
              {exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exerciseIndex}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-all bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-6">
                    <input
                      type="text"
                      placeholder="Exercise Name"
                      value={exercise.name}
                      onChange={(e) => handleExerciseNameChange(exerciseIndex, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(exerciseIndex)}
                      className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">Sets</h3>
                      <button
                        type="button"
                        onClick={() => addSet(exerciseIndex)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Set
                      </button>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Set</th>
                            <th className="px-6 py-3">Reps</th>
                            <th className="px-6 py-3">Weight (kg)</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {exercise.sets.map((set, setIndex) => (
                            <tr key={setIndex} className="text-gray-800">
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {setIndex + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
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
                                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
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
                                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  disabled={exercise.sets.length <= 1}
                                >
                                  Remove
                                </button>
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

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-sm transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Workout...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Workout
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 