import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { getWorkoutDayNames } from "@/actions/workouts";
import prisma from "@/lib/prisma";

export default async function EditWorkout({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  // Redirect unauthenticated users to login
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get workout details
  const { id } = await Promise.resolve(params);
  const workout = await prisma.workout.findUnique({
    where: {
      id,
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  // Check if user has access to this workout
  const isOwner = workout.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect("/");
  }

  const workoutDays = await getWorkoutDayNames();

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <WorkoutHeader
        title="Edit Workout"
        description="Update your workout details"
        backHref={`/workout/${id}`}
      />
      <WorkoutForm 
        workoutDays={workoutDays} 
        initialWorkout={{
          id: workout.id,
          date: workout.date,
          name: workout.name || "",
          workoutDayId: workout.workoutDayId || "",
          exercises: workout.exercises.map(exercise => ({
            name: exercise.name,
            sets: exercise.sets.map(set => ({
              reps: set.reps,
              weight: set.weight || 0,
              weightUnit: set.weightUnit,
            }))
          }))
        }}
      />
    </div>
  );
}