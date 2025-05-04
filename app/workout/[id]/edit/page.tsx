import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
// Import the refactored WorkoutForm
import { WorkoutForm } from "@/components/workout/WorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch the workout data to pass to the form
  const workout = await prisma.workout.findUnique({
    where: {
      id: params.id,
      userId: session.user.id, // Ensure user can only edit their own workouts
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
        orderBy: { createdAt: 'asc' } // Maintain order
      },
    },
  });

  // If workout not found or doesn't belong to user, show 404
  if (!workout) {
    notFound();
  }

  // Transform data slightly if needed (e.g., ensure weight is number)
  const transformedWorkoutData = {
      ...workout,
      exercises: workout.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({
              ...set,
              weight: set.weight ?? 0 // Ensure weight is not null for form
          }))
      }))
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <WorkoutHeader title="Edit Workout" />
      {/* Render the WorkoutForm and pass the data as initialData */}
      <WorkoutForm initialData={transformedWorkoutData as any} />
    </div>
  );
} 