"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Dumbbell } from "lucide-react";

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

interface WorkoutCardProps {
  workout: {
    id: string;
    date: string;
    name: string | null;
    exercises: Array<{
      name: string;
      sets: Array<{
        reps: number;
        weight: number;
      }>;
    }>;
  };
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const totalExercises = workout.exercises.length;
  const totalSets = workout.exercises.reduce(
    (count, exercise) => count + exercise.sets.length,
    0
  );

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
              className="flex items-center justify-between text-sm"
            >
              <span className="font-medium">{exercise.name}</span>
              <span className="text-muted-foreground">
                {exercise.sets.length} sets
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
