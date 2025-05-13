import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getWorkoutById } from "@/actions/workouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Edit, 
  Calendar, 
  ChevronLeft, 
  BarChart3, 
  Layers,
  Clock,
  Award,
  Repeat,
  Weight,
  ArrowRight,
  CheckCircle2,
  Flame
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { WeightUnit } from "@/lib/generated/prisma/client";

interface WorkoutPageProps {
  params: {
    id: string;
  };
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const workout = await getWorkoutById(params.id);

  if (!workout) {
    notFound();
  }

  const formatWeight = (weight: number | null, unit: WeightUnit = WeightUnit.KG): string => {
    if (weight === null || weight === 0) return "Bodyweight";
    
    switch (unit) {
      case WeightUnit.KG:
        return `${weight}kg`;
      case WeightUnit.LB:
        return `${weight}lb`;
      case WeightUnit.PLATES:
        return `${weight} Plate${weight === 1 ? "" : "s"}`;
      default:
        return `${weight}kg`;
    }
  };

  // Calculate total volume (sum of reps * weight across all sets)
  const totalVolume = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exTotal, set) => {
      return exTotal + set.reps * (set.weight || 0);
    }, 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Button variant="outline" size="sm" asChild className="group">
          <Link href="/workout">
            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Workouts
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild className="group">
          <Link href={`/workout/${workout.id}/edit`}>
            <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
            Edit Workout
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all lg:col-span-3 border-t-4 border-t-primary">
          <CardHeader className="pb-2 bg-muted/40">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                <CardTitle className="text-xl sm:text-2xl">
                  {workout.name || "Unnamed Workout"}
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>{format(new Date(workout.date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>{format(new Date(workout.date), "h:mm a")}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-1">
                {workout.workoutDay && (
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1.5 text-primary" />
                    <Badge variant="outline" className="text-sm font-medium bg-background">
                      {workout.workoutDay.name}
                    </Badge>
                  </div>
                )}
                {workout.workoutDay?.level && (
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-1.5 text-primary" />
                    <Badge variant="secondary" className="text-sm font-medium">
                      {workout.workoutDay.level.name}
                    </Badge>
                  </div>
                )}
                
                {workout.workoutDay?.level && (
                  <Link 
                    href={`/levels/${encodeURIComponent(workout.workoutDay.level.name)}/${encodeURIComponent(workout.workoutDay.name)}`}
                    className="flex items-center text-xs px-3 py-1 rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                  >
                    <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                    View Training Progress
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-3">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Exercises</div>
                  <div className="text-xl font-semibold">{workout.exercises.length}</div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-3">
                  <Repeat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Sets</div>
                  <div className="text-xl font-semibold">
                    {workout.exercises.reduce((count, ex) => count + ex.sets.length, 0)}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 flex items-center">
                <div className="bg-primary/10 rounded-full p-2 mr-3">
                  <Weight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="text-xl font-semibold">{totalVolume.toLocaleString()}kg</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              {workout.exercises.map((exercise, exIndex) => (
                <div key={exercise.id} className="border rounded-xl overflow-hidden bg-card">
                  <div className="bg-muted/30 px-4 py-3 flex items-center justify-between border-b">
                    <div className="flex items-center">
                      <Flame className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-semibold">{exercise.name}</h3>
                    </div>
                    <Badge variant="outline" className="bg-background">
                      {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {exercise.sets.map((set, index) => (
                        <div key={set.id} className="flex flex-wrap items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="w-16 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1.5 text-primary" />
                            <span className="font-medium">Set {index + 1}</span>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                            <div className="flex items-center gap-1.5">
                              <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm font-medium">
                                {set.reps} reps
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="bg-primary/10 rounded-full px-3 py-1 text-sm font-medium">
                                {formatWeight(set.weight, set.weightUnit)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                Workout Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(workout.date), "MMM d, yyyy")}</span>
                </div>
                {workout.workoutDay && (
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Workout Day</span>
                    <Badge variant="outline">{workout.workoutDay.name}</Badge>
                  </div>
                )}
                {workout.workoutDay?.level && (
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <Badge variant="secondary">{workout.workoutDay.level.name}</Badge>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Exercises</span>
                  <span className="font-medium">{workout.exercises.length}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Sets</span>
                  <span className="font-medium">
                    {workout.exercises.reduce((count, ex) => count + ex.sets.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Volume</span>
                  <span className="font-medium">{totalVolume.toLocaleString()}kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full group" asChild>
            <Link href={`/workout/${workout.id}/edit`}>
              <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              Edit Workout
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}