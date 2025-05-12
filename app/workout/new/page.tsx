import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { getWorkoutDayNames } from "@/actions/workouts";

export default async function NewWorkout() {
  const session = await auth();


  // Redirect unauthenticated users to login
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const workoutDays = await getWorkoutDayNames();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <WorkoutHeader
        title="New Workout"
        description="Create a new workout for today"
        backHref="/workout"
      />
      <WorkoutForm workoutDays={workoutDays} />
    </div>
  );
}
