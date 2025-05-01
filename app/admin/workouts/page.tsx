import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminWorkouts() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Get all users with their workout counts, including the admin
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      _count: {
        select: {
          workouts: true,
        },
      },
      workouts: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Workouts</h1>
        <Link
          href="/workout/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Log New Workout
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Link key={user.id} href={`/admin/workouts/${user.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div>
                    <CardTitle>{user.name || "Unnamed User"}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Workouts
                    </p>
                    <p className="text-2xl font-bold">{user._count.workouts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Workout
                    </p>
                    <p className="text-sm">
                      {user.workouts[0]?.createdAt
                        ? new Date(
                            user.workouts[0].createdAt
                          ).toLocaleDateString()
                        : "No workouts yet"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
