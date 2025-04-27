"use client";

import { format } from "date-fns";
import Link from "next/link";

interface Set {
  id: string;
  reps: number;
  weight: number | null;
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

export function WorkoutCard({ workout }: { workout: Workout }) {
  // Calculate total volume (weight * reps)
  const totalVolume = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + (set.weight || 0) * set.reps;
    }, 0);
  }, 0);

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {format(new Date(workout.date), "EEEE, MMMM d")}
          </h3>
          <p className="text-gray-500 text-sm">{format(new Date(workout.date), "yyyy")}</p>
        </div>
        <Link
          href={`/workout/${workout.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow"
        >
          View Details
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-3 mb-4">
        {workout.exercises.slice(0, 3).map((exercise) => (
          <div key={exercise.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <span className="text-gray-800 font-medium">{exercise.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {exercise.sets.length} sets
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {workout.exercises.length > 3 && (
        <p className="text-gray-500 text-sm mb-4">
          +{workout.exercises.length - 3} more exercises
        </p>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Total Exercises</p>
          <p className="text-xl font-bold text-gray-800">{workout.exercises.length}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Total Volume</p>
          <p className="text-xl font-bold text-gray-800">{Math.round(totalVolume)} kg</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Total Sets</p>
          <p className="text-xl font-bold text-gray-800">
            {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
          </p>
        </div>
      </div>
    </div>
  );
} 