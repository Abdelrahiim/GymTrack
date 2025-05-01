import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWorkouts } from "@/actions/workouts";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const { workouts, total, totalPages } = await getWorkouts({
    search,
    page,
    limit: 10,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workouts..."
                className="pl-9"
                defaultValue={search}
                name="search"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>

          {workouts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workouts found
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                asChild
              >
                <Link
                  href={`/workout?page=${page - 1}${
                    search ? `&search=${search}` : ""
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                asChild
              >
                <Link
                  href={`/workout?page=${page + 1}${
                    search ? `&search=${search}` : ""
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 