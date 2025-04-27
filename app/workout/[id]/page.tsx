import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function WorkoutDetails({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Get workout details
  const workout = await prisma.workout.findUnique({
    where: {
      id: params.id,
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Workout Details</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-wrap justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {format(new Date(workout.date), "EEEE, MMMM d, yyyy")}
            </h2>
            {isAdmin && !isOwner && (
              <p className="text-gray-500 mt-1">
                User: {workout.user.name || "Unknown"}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {workout.exercises.map((exercise) => (
            <div key={exercise.id} className="border-t pt-6">
              <h3 className="text-xl font-medium mb-4">{exercise.name}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-6">Set</th>
                      <th className="pb-2 pr-6">Reps</th>
                      <th className="pb-2">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, index) => (
                      <tr key={set.id} className="border-b">
                        <td className="py-3 pr-6">{index + 1}</td>
                        <td className="py-3 pr-6">{set.reps}</td>
                        <td className="py-3">{set.weight || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
