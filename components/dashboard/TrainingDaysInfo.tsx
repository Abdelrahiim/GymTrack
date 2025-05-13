"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, CheckCircle, HelpCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, isToday, isSameDay, startOfWeek, addDays, isAfter, isSameWeek, eachDayOfInterval, subWeeks } from "date-fns";

interface WorkoutDay {
  id: string;
  dayNumber: number;
  name: string;
  level?: {
    id: string;
    name: string;
  } | null;
}

interface Workout {
  id: string;
  date: Date;
  name: string | null;
  workoutDay?: { 
    id: string; 
    name: string;
    level?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

interface TrainingDaysInfoProps {
  workoutDays: WorkoutDay[];
  recentWorkouts: Workout[];
  daysPerWeek: number;
}

export function TrainingDaysInfo({ workoutDays, recentWorkouts, daysPerWeek }: TrainingDaysInfoProps) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get the start of the current week
  const weekStart = startOfWeek(today);
  
  // Analyze workout patterns over the last 8 weeks
  const eightWeeksAgo = subWeeks(today, 8);
  const daysToAnalyze = eachDayOfInterval({ start: eightWeeksAgo, end: today });
  const weekCount = Math.ceil(daysToAnalyze.length / 7);
  
  // Initialize pattern analysis data
  const patterns = new Array(7).fill(0).map(() => ({ 
    workoutCount: 0,
    workouts: [] as Workout[],
    frequency: 0,
    lastWorkout: null as Workout | null
  }));
  
  // Count workouts by day of week
  for (const workout of recentWorkouts) {
    const workoutDate = new Date(workout.date);
    if (workoutDate >= eightWeeksAgo) {
      const dayNumber = workoutDate.getDay(); // 0-6
      patterns[dayNumber].workoutCount++;
      patterns[dayNumber].workouts.push(workout);
      
      // Keep track of most recent workout for each day
      if (!patterns[dayNumber].lastWorkout || 
          workoutDate > new Date(patterns[dayNumber].lastWorkout.date)) {
        patterns[dayNumber].lastWorkout = workout;
      }
    }
  }
  
  // Calculate frequency (0-1) of workouts on each day
  for (let i = 0; i < 7; i++) {
    patterns[i].frequency = weekCount > 0 ? patterns[i].workoutCount / weekCount : 0;
  }
  
  // Find workouts from current week
  const workoutsByDay = new Map<number, Workout>();
  
  for (const workout of recentWorkouts) {
    const workoutDate = new Date(workout.date);
    if (isSameWeek(workoutDate, today)) {
      const dayNumber = workoutDate.getDay();
      workoutsByDay.set(dayNumber, workout);
    }
  }
  
  // Create array with all days data
  const allDays = Array.from({ length: 7 }, (_, i) => {
    const dayNumber = i; // 0-6 (Sunday-Saturday)
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
    
    // Get pattern data for this day
    const pattern = patterns[dayNumber];
    
    // Check if there's a completed workout for this day in the current week
    const completedWorkout = workoutsByDay.get(dayNumber);
    const isCompletedThisWeek = !!completedWorkout;
    
    // Check if this is a future day in the current week
    const dayDate = addDays(weekStart, i);
    const isFutureDay = isAfter(dayDate, today);
    const isTodayDay = isToday(dayDate);
    
    // A day is an active training day if workout frequency is at least 30%
    const isActiveTrainingDay = pattern.frequency >= 0.3;
    
    // Get the workout name (from the completed workout or from pattern)
    const workoutName = isCompletedThisWeek 
      ? (completedWorkout.name || completedWorkout.workoutDay?.name || 'Workout')
      : pattern.lastWorkout
        ? (pattern.lastWorkout.name || pattern.lastWorkout.workoutDay?.name || 'Workout')
        : null;
    
    return {
      dayNumber,
      dayName,
      shortName: dayName.substring(0, 3),
      isActiveTrainingDay,
      isToday: isTodayDay,
      isFutureDay,
      workoutName,
      isCompletedThisWeek,
      frequency: pattern.frequency,
      workoutCount: pattern.workoutCount
    };
  });
  
  // Count actual training days based on patterns
  const activeTrainingDays = allDays.filter(day => day.isActiveTrainingDay).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Your Training Pattern
          </CardTitle>
          <Badge variant="outline">{activeTrainingDays} active days</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Based on your workout history, you typically train on {activeTrainingDays} days per week.
          </p>
          
          <div className="grid grid-cols-1 gap-2">
            {allDays.map((day) => (
              <div 
                key={day.dayNumber}
                className={`p-3 rounded-md border flex items-center justify-between ${
                  day.isToday ? 'border-primary' : 'border-muted'
                } ${
                  day.isCompletedThisWeek 
                    ? 'bg-primary/10' 
                    : day.isActiveTrainingDay 
                      ? 'bg-accent/30' 
                      : ''
                }`}
              >
                <div className="flex items-center">
                  {day.isCompletedThisWeek ? (
                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                  ) : day.isFutureDay ? (
                    <HelpCircle className="h-4 w-4 mr-3 text-muted-foreground opacity-70" />
                  ) : day.isActiveTrainingDay ? (
                    <Dumbbell className={`h-4 w-4 mr-3 ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`} />
                  ) : (
                    <div className="w-4 h-4 mr-3" /> 
                  )}
                  <div>
                    <div className="font-medium flex items-center">
                      {day.dayName}
                      {day.isToday && (
                        <Badge variant="outline" className="ml-2 text-xs">Today</Badge>
                      )}
                    </div>
                    
                    {day.isCompletedThisWeek ? (
                      <div className="text-sm font-medium">{day.workoutName}</div>
                    ) : day.isToday ? (
                      <div className="text-sm text-muted-foreground">_</div>
                    ) : day.isFutureDay ? (
                      <div className="text-sm text-muted-foreground">Incoming</div>
                    ) : day.isActiveTrainingDay ? (
                      <div className="text-sm text-muted-foreground">
                        {day.workoutName ? `Usually: ${day.workoutName}` : 'Training day'}
                        {day.frequency > 0 && ` (${Math.round(day.frequency * 100)}%)`}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Rest day</div>
                    )}
                    
                    {/* Add link to level workout day page if applicable */}
                    {(day.isCompletedThisWeek || day.isActiveTrainingDay) && 
                     day.workoutName && 
                     patterns[day.dayNumber].lastWorkout?.workoutDay?.level && (
                      <Link 
                        href={`/levels/${encodeURIComponent(patterns[day.dayNumber].lastWorkout?.workoutDay?.level?.name || '')}/${encodeURIComponent(patterns[day.dayNumber].lastWorkout?.workoutDay?.name || '')}`}
                        className="text-xs text-primary hover:underline flex items-center mt-1"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        View progress
                      </Link>
                    )}
                  </div>
                </div>
                
                {day.isCompletedThisWeek && (
                  <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                )}
                {day.isFutureDay && day.isActiveTrainingDay && (
                  <Badge variant="outline">Planned</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 