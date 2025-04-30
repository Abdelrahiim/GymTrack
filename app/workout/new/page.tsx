import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { NewWorkoutForm } from "@/components/workout/NewWorkoutForm";

export default async function NewWorkout() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <WorkoutHeader title="Log New Workout" />
      <NewWorkoutForm />
    </div>
  );
}
