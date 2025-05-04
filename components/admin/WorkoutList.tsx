"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Workout {
  id: string;
  createdAt: Date;
  exercises: {
    id: string;
    name: string;
    sets: {
      id: string;
      weight: number | null;
      reps: number;
    }[];
  }[];
}

interface WorkoutListProps {
  workouts: Workout[];
}

export function WorkoutList({ workouts }: WorkoutListProps) {
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <Card key={workout.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {new Date(workout.createdAt).toLocaleDateString()}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleWorkout(workout.id)}
              >
                {expandedWorkout === workout.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {expandedWorkout === workout.id && (
            <CardContent>
              <div className="space-y-4">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="space-y-2">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={set.id}>
                          Set {setIndex + 1}:{" "}
                          {set.weight ? `${set.weight}kg` : "N/A"} × {set.reps}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
