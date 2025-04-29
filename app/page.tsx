
import { redirect } from "next/navigation";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { getWorkouts } from "@/app/actions/workouts";
import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  console.log(session);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get user's recent workouts
  const { workouts: recentWorkouts } = await getWorkouts();

  // Get workouts for the current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklyWorkouts = recentWorkouts.filter((workout) => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
  });

  // Calculate the days in the week
  const daysInWeek = 7;

  // Get some basic stats
  const totalWorkouts = recentWorkouts.length;
  const totalExercises = recentWorkouts.reduce(
    (count, workout) => count + workout.exercises.length,
    0
  );
  const totalSets = recentWorkouts.reduce(
    (count, workout) =>
      count +
      workout.exercises.reduce(
        (sets, exercise) => sets + exercise.sets.length,
        0
      ),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome, {session.user.name}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Track your gym progress and achieve your fitness goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Weekly Progress
              </h2>
              <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Week of{" "}
                {startOfWeek.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <WeeklyProgress workouts={weeklyWorkouts} />
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Workouts
              </h2>
              {recentWorkouts.length > 0 && (
                <Link
                  href="/workouts"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all →
                </Link>
              )}
            </div>

            {recentWorkouts.length > 0 ? (
              <div className="space-y-6">
                {recentWorkouts.slice(0, 5).map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-gray-600 text-lg mb-4">
                  No workouts recorded yet
                </p>
                <p className="text-gray-500 mb-6">
                  Start by logging your first workout session
                </p>
                <Link
                  href="/workout/new"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Log Your First Workout
                </Link>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-6">Quick Stats</h2>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white/80 text-sm font-medium">
                  Workouts This Week
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-extrabold mt-1">
                    {weeklyWorkouts.length}
                  </p>
                  <p className="text-white/80">of {daysInWeek} days</p>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mt-2">
                  <div
                    className="bg-white h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (weeklyWorkouts.length / 7) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/80 text-sm font-medium">
                    Total Workouts
                  </p>
                  <p className="text-3xl font-bold mt-1">{totalWorkouts}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/80 text-sm font-medium">
                    Total Exercises
                  </p>
                  <p className="text-3xl font-bold mt-1">{totalExercises}</p>
                </div>

                <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white/80 text-sm font-medium">
                    Total Sets
                  </p>
                  <p className="text-3xl font-bold mt-1">{totalSets}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/workout/new"
                className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg shadow transition-colors duration-200"
              >
                Log New Workout
              </Link>

              <Link
                href="/workouts"
                className="block w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 text-center font-medium rounded-lg border border-gray-300 transition-colors duration-200"
              >
                View All Workouts
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
