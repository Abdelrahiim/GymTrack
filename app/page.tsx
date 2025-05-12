import { Suspense } from "react";
import { getUserLevelInfo } from "@/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CalendarDays, ChevronRight, Dumbbell, LineChart, Medal, Star, TrendingUp, Flame, Award } from "lucide-react";
import { formatDistanceToNow, format, isSameDay } from "date-fns";

export default async function Dashboard() {
  const dashboardData = await getUserLevelInfo();
  const { 
    user, 
    currentLevel, 
    allLevels, 
    recentWorkouts, 
    weekProgress, 
    stats 
  } = dashboardData;

  // Calculate week progress percentage
  const progressPercentage = weekProgress.totalDays 
    ? Math.round((weekProgress.completedDays.length / weekProgress.totalDays) * 100) 
    : 0;

  // Get today's planned workout (if any)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todayWorkoutDay = currentLevel?.workoutDays.find(day => day.dayNumber === dayOfWeek + 1);
  
  // Check if today's workout is completed
  const isTodayWorkoutCompleted = recentWorkouts.some(workout => 
    workout.workoutDay?.id === todayWorkoutDay?.id && 
    isSameDay(new Date(workout.date), today)
  );

  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {user.name || "Athlete"}</h1>
          <p className="text-muted-foreground">
            Track your training progress and stay consistent
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/workout/new">Log Workout</Link>
          </Button>
        </div>
      </div>

      {/* Level Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-primary" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentLevel ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{currentLevel.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentLevel.description || "No description"}</p>
                  </div>
                  <Badge variant="outline">{currentLevel.daysPerWeek} days/week</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Weekly progress</span>
                    <span className="font-medium">{weekProgress.completedDays.length}/{weekProgress.totalDays} days</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                {/* Workout Schedule */}
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-3">Weekly Schedule</h4>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const dayNumber = i + 1;
                      const workoutDay = currentLevel.workoutDays.find(day => day.dayNumber === dayNumber);
                      const isCompleted = weekProgress.completedDays.includes(dayNumber);
                      const isToday = dayOfWeek + 1 === dayNumber;
                      
                      return (
                        <div 
                          key={`day-${dayNumber}`}
                          className={`p-2 text-center rounded-md border text-xs ${
                            isToday ? 'border-primary border-2' : 'border-muted'
                          } ${
                            isCompleted ? 'bg-primary/20' : ''
                          }`}
                        >
                          <div className="font-medium">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                          </div>
                          {workoutDay ? (
                            <div className="mt-1 truncate">{workoutDay.name}</div>
                          ) : (
                            <div className="mt-1 text-muted-foreground">Rest</div>
                          )}
                          {isCompleted && (
                            <div className="mt-1 text-primary">✓ Done</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTitle>No level assigned</AlertTitle>
                <AlertDescription>
                  You don't have a training level assigned yet. 
                  {allLevels.length > 0 ? (
                    <Link href="/levels" className="ml-1 underline">Choose a level</Link>
                  ) : (
                    <Link href="/levels/new" className="ml-1 underline">Create your first level</Link>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Today's Workout */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Today's Workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayWorkoutDay ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{todayWorkoutDay.name}</h3>
                  <p className="text-sm text-muted-foreground">{todayWorkoutDay.description || "No description"}</p>
                </div>
                
                {isTodayWorkoutCompleted ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                    <div className="flex items-center text-green-700 dark:text-green-400">
                      <Star className="h-5 w-5 mr-2" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <p className="text-sm mt-1 text-green-700/80 dark:text-green-400/80">
                      Great job! You've completed today's workout.
                    </p>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/workout/new?dayId=${todayWorkoutDay.id}`}>
                      Start Workout
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">Rest Day</h3>
                <p className="text-sm text-muted-foreground">
                  Today is a rest day. Take time to recover!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats & Recent Workouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:flex md:flex-col">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Flame className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-2xl font-bold">{stats.currentStreak}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Best: {stats.longestStreak}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Dumbbell className="h-5 w-5 text-primary mr-2" />
                <span className="text-2xl font-bold">{stats.totalWorkouts}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <LineChart className="h-5 w-5 text-indigo-500 mr-2" />
                <span className="text-2xl font-bold">{stats.totalExercises}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{stats.totalSets}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Workouts */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Recent Workouts
              </CardTitle>
              <Link href="/workout" className="text-sm text-primary flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.slice(0, 4).map((workout) => (
                  <Link href={`/workout/${workout.id}`} key={workout.id} className="block">
                    <div className="flex justify-between items-center p-3 rounded-lg border hover:bg-accent hover:border-primary/30 transition-colors">
                      <div>
                        <h3 className="font-medium">
                          {workout.name || workout.workoutDay?.name || "Unnamed Workout"}
                        </h3>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <CalendarDays className="h-3.5 w-3.5 mr-1" />
                          {format(new Date(workout.date), "PPP")} · {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{workout.exercises.length}</span> exercises
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No workouts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking your workouts to see your progress
                </p>
                <Button asChild>
                  <Link href="/workout/new">Log Your First Workout</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}