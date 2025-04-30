import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWorkouts } from "@/app/actions/workouts";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string; week?: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const weekOffset = Number(searchParams.week) || 0;

  // Calculate the date range for the current week
  const today = new Date();
  const startDate = startOfWeek(subWeeks(today, weekOffset));
  const endDate = endOfWeek(subWeeks(today, weekOffset));

  const { workouts, total, totalPages } = await getWorkouts({
    search,
    page,
    limit: 10,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Workouts</h1>
        </div>
        <Button asChild>
          <Link href="/workout/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New Workout
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Week of {format(startDate, "MMMM d")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(startDate, "MMMM d")} - {format(endDate, "MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={weekOffset === 0}
              >
                <Link
                  href={`/workouts?week=${weekOffset - 1}${
                    search ? `&search=${search}` : ""
                  }`}
                >
                  Previous Week
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link
                  href={`/workouts?week=${weekOffset + 1}${
                    search ? `&search=${search}` : ""
                  }`}
                >
                  Next Week
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-4">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>

      {workouts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No workouts found for this week
            </p>
            <Button asChild className="mt-4">
              <Link href="/workout/new">Create New Workout</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={page <= 1}
          >
            <Link
              href={`/workouts?page=${page - 1}&week=${weekOffset}${
                search ? `&search=${search}` : ""
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={page >= totalPages}
          >
            <Link
              href={`/workouts?page=${page + 1}&week=${weekOffset}${
                search ? `&search=${search}` : ""
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
} 