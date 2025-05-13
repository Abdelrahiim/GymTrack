import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getLevelWorkoutDayData } from "@/actions/levels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExerciseProgressChart } from "@/components/levels/ExerciseProgressChart";
import { 
  ChevronLeft, 
  CalendarClock, 
  BarChart3, 
  Dumbbell, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { format, formatDistance } from "date-fns";

interface LevelWorkoutDayPageProps {
  params: { 
    levelName: string;
    workoutDayName: string;
  };
}

export default async function LevelWorkoutDayPage({ params }: LevelWorkoutDayPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const { levelName, workoutDayName } = params;
  const decodedLevelName = decodeURIComponent(levelName);
  const decodedWorkoutDayName = decodeURIComponent(workoutDayName);

  try {
    const data = await getLevelWorkoutDayData(decodedLevelName, decodedWorkoutDayName);
    const { level, workoutDay, workouts, exerciseProgress } = data;
    
    // Get all unique exercise names across all workouts
    const allExercises = new Set<string>();
    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        allExercises.add(exercise.name);
      }
    }
    
    // Get last two workouts for comparison
    const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;
    const previousWorkout = workouts.length > 1 ? workouts[workouts.length - 2] : null;
    const lastWorkoutDate = lastWorkout ? new Date(lastWorkout.date) : null;
    
    // Organize exercises by workout for comparison
    type ExerciseSummary = {
      name: string;
      maxWeight: number;
      totalReps: number;
      totalVolume: number;
      change?: {
        weight: number;
        reps: number;
        volume: number;
      }
    };
    
    const getExerciseSummaries = (workout: typeof lastWorkout): Record<string, ExerciseSummary> => {
      const summaries: Record<string, ExerciseSummary> = {};
      
      if (!workout) return summaries;
      
      for (const exercise of workout.exercises) {
        let maxWeight = 0;
        let totalReps = 0;
        let totalVolume = 0;
        
        for (const set of exercise.sets) {
          if (set.weight && set.weight > maxWeight) {
            maxWeight = set.weight;
          }
          totalReps += set.reps;
          totalVolume += set.reps * (set.weight || 0);
        }
        
        summaries[exercise.name] = {
          name: exercise.name,
          maxWeight,
          totalReps,
          totalVolume
        };
      }
      
      return summaries;
    };
    
    const lastWorkoutExercises = getExerciseSummaries(lastWorkout);
    const previousWorkoutExercises = getExerciseSummaries(previousWorkout);
    
    // Calculate changes between workouts
    if (previousWorkout) {
      for (const [name, summary] of Object.entries(lastWorkoutExercises)) {
        if (previousWorkoutExercises[name]) {
          summary.change = {
            weight: summary.maxWeight - previousWorkoutExercises[name].maxWeight,
            reps: summary.totalReps - previousWorkoutExercises[name].totalReps,
            volume: summary.totalVolume - previousWorkoutExercises[name].totalVolume,
          };
        }
      }
    }
    
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" asChild className="group">
            <Link href="/workout">
              <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Workouts
            </Link>
          </Button>
          {lastWorkout && (
            <Button variant="default" size="sm" asChild>
              <Link href={`/workout/${lastWorkout.id}`}>
                View Latest Workout
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      {workoutDay.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Level: <Badge variant="outline" className="ml-1">{level.name}</Badge>
                    </CardDescription>
                    {workoutDay.description && (
                      <p className="mt-2 text-sm text-muted-foreground max-w-md">
                        {workoutDay.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {lastWorkoutDate && (
                      <span className="text-sm text-muted-foreground flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1" />
                        Last workout: {formatDistance(lastWorkoutDate, new Date(), { addSuffix: true })}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Dumbbell className="h-4 w-4 mr-1" />
                      {workouts.length} workouts in the last 3 weeks
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Workout Comparison */}
            {lastWorkout && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Last Workout Comparison
                  </CardTitle>
                  <CardDescription>
                    {previousWorkout 
                      ? `Comparing ${format(new Date(lastWorkout.date), "MMM d")} vs ${format(new Date(previousWorkout.date), "MMM d")}`
                      : `Your most recent ${workoutDay.name} on ${format(new Date(lastWorkout.date), "MMM d, yyyy")}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Exercise</th>
                          <th className="text-right py-2 font-medium">Max Weight</th>
                          <th className="text-right py-2 font-medium">Total Reps</th>
                          <th className="text-right py-2 font-medium">Volume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.values(lastWorkoutExercises).map(exercise => (
                          <tr key={exercise.name} className="hover:bg-muted/30">
                            <td className="py-3 font-medium">{exercise.name}</td>
                            <td className="text-right py-3">
                              <div className="flex items-center justify-end gap-1">
                                {exercise.maxWeight}kg
                                {exercise.change ? (
                                  <ChangeIndicator value={exercise.change.weight} />
                                ) : null}
                              </div>
                            </td>
                            <td className="text-right py-3">
                              <div className="flex items-center justify-end gap-1">
                                {exercise.totalReps}
                                {exercise.change ? (
                                  <ChangeIndicator value={exercise.change.reps} />
                                ) : null}
                              </div>
                            </td>
                            <td className="text-right py-3">
                              <div className="flex items-center justify-end gap-1">
                                {exercise.totalVolume}kg
                                {exercise.change ? (
                                  <ChangeIndicator value={exercise.change.volume} />
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Progress Charts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Exercise Progress
                </CardTitle>
                <CardDescription>
                  Tracking your progress over the last 3 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Array.from(allExercises).length > 0 ? (
                  <div className="space-y-8">
                    <div className="bg-muted/20 p-4 rounded-lg w-full">
                      <h3 className="text-lg font-medium mb-4">All Exercises Progress</h3>
                      <div className="h-[450px] w-full">
                        <ExerciseProgressChart 
                          exerciseNames={Array.from(allExercises)}
                          exerciseProgressData={exerciseProgress}
                          showMultipleExercises={true}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No exercise data available for the last 3 weeks
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                  Workout Day Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Day Number</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Day {workoutDay.dayNumber} of {level.daysPerWeek}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold">Common Exercises</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(allExercises).slice(0, 5).map(exercise => (
                      <Badge key={exercise} variant="outline">
                        {exercise}
                      </Badge>
                    ))}
                    {allExercises.size > 5 && (
                      <Badge variant="outline">+{allExercises.size - 5} more</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold">Recent Workouts</h3>
                  <div className="space-y-2 mt-2">
                    {workouts.slice(-3).reverse().map(workout => (
                      <div key={workout.id} className="flex justify-between items-center text-sm p-2 border rounded-md">
                        <span>{format(new Date(workout.date), "MMM d, yyyy")}</span>
                        <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                          <Link href={`/workout/${workout.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button className="w-full" asChild>
              <Link href={`/workout/new?workoutDayId=${workoutDay.id}`}>
                Start New Workout
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in workout day page:", error);
    notFound();
  }
}

// Helper component to show change indicators
function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) {
    return <ArrowUp className="h-3 w-3 text-green-500" />;
  } 
  if (value < 0) {
    return <ArrowDown className="h-3 w-3 text-red-500" />;
  }
  return <Minus className="h-3 w-3 text-gray-400" />;
} 