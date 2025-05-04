import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
// Import the refactored WorkoutForm AND its expected prop type
import { WorkoutForm, type InitialWorkoutData } from "@/components/workout/WorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch the workout data to pass to the form
  const { id } = await Promise.resolve(params);
  const workout = await prisma.workout.findUnique({
    where: {
      id,
      userId: session.user.id, // Ensure user can only edit their own workouts
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
        orderBy: { createdAt: "asc" }, // Maintain order
      },
    },
  });

  // If workout not found or doesn't belong to user, show 404
  if (!workout) {
    notFound();
  }

  // The fetched workout structure should match InitialWorkoutData 
  // if the Prisma query is correct. We don't need the transformation.
  const initialDataForForm: InitialWorkoutData = workout;

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <WorkoutHeader title="Edit Workout" />
      {/* Pass the correctly typed data without casting */}
      <WorkoutForm initialData={initialDataForForm} />
    </div>
  );
}
