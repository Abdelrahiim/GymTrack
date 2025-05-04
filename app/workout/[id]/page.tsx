import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Pencil } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href={isAdmin ? "/admin/workouts" : "/"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Workout Details</h1>
        </div>
        {isAdmin && (
          <Link href={`/admin/workouts/${workout.userId}`}>
            <Button variant="outline">View All Workouts</Button>
          </Link>
        )}
        {isOwner && (
          <Link href={`/workout/${params.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Workout
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {/* Display workout name if available */}
              {workout.name && (
                <CardTitle className="text-2xl mb-1">{workout.name}</CardTitle>
              )}
              <p className="text-sm text-muted-foreground">
                {format(new Date(workout.date), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            {isAdmin && (
              <div className="text-sm text-muted-foreground">
                User: {workout.user.name || "Unnamed User"}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workout.exercises.map((exercise) => (
              <div key={exercise.id} className="space-y-2">
                <h3 className="text-lg font-medium">{exercise.name}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {exercise.sets.map((set) => (
                    <div
                      key={set.id}
                      className="bg-muted p-3 rounded-lg text-center"
                    >
                      <div className="text-sm text-muted-foreground">Set</div>
                      <div className="font-medium">
                        {set.weight ? `${set.weight}kg` : "Bodyweight"} ×{" "}
                        {set.reps}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
