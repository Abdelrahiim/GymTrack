"use client";

import { format, startOfWeek, addDays } from "date-fns";

interface Workout {
  id: string;
  date: Date;
}

export function WeeklyProgress({ workouts }: { workouts: Workout[] }) {
  // Create an array of the days of the current week
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Create a map of days with workouts
  const workoutMap = new Map<string, boolean>();
  workouts.forEach((workout) => {
    const dateStr = format(new Date(workout.date), "yyyy-MM-dd");
    workoutMap.set(dateStr, true);
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const hasWorkout = workoutMap.has(dateStr);
          const isToday = format(today, "yyyy-MM-dd") === dateStr;
          const isPast = day < today;
          
          return (
            <div key={dateStr} className="flex flex-col items-center">
              <span className="text-sm font-medium text-gray-600 mb-2">
                {format(day, "EEE")}
              </span>
              <div 
                className={`
                  w-14 h-14 rounded-full flex flex-col items-center justify-center
                  ${isToday ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                  ${hasWorkout 
                    ? "bg-blue-500 text-white shadow-md" 
                    : isPast 
                      ? "bg-gray-100 text-gray-400" 
                      : "bg-gray-50 text-gray-500 border border-gray-200"}
                  transition-all duration-200 transform hover:scale-110
                `}
              >
                <span className={`text-lg font-bold ${hasWorkout ? "text-white" : ""}`}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-center h-6">
                {hasWorkout ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Complete
                  </span>
                ) : isPast ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Missed
                  </span>
                ) : isToday ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Today
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Workout Done</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">No Workout</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Weekly Progress</p>
            <p className="text-xl font-bold text-gray-800">
              {workouts.length}/{weekDays.length} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 