import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Workout Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {format(new Date(workout.date), "EEEE, MMMM d, yyyy")}
          </CardTitle>
          {isAdmin && !isOwner && (
            <p className="text-muted-foreground">
              User: {workout.user.name || "Unknown"}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {workout.exercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  <CardTitle className="text-xl">{exercise.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {exercise.sets.map((set, index) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="font-medium">Set {index + 1}</div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Reps</div>
                          <div className="font-medium">{set.reps}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Weight</div>
                          <div className="font-medium">{set.weight || 0} kg</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
