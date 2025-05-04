import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { getAllDistinctWorkoutNames } from "@/actions/workouts";
import { WorkoutFilter } from "@/components/dashboard/WorkoutFilter";
import type { Prisma } from "@/lib/generated/prisma";

// Define types based on Prisma schema and query
type WorkoutWithUser = {
	id: string;
	date: Date;
	name: string | null;
	user: {
		id: string;
		name: string | null;
		image: string | null;
	};
	_count: {
		exercises: number;
	};
};

// Helper function to group workouts by date
const groupWorkoutsByDate = (workouts: WorkoutWithUser[]) => {
	return workouts.reduce(
		(acc, workout) => {
			const dateStr = format(new Date(workout.date), "yyyy-MM-dd");
			if (!acc[dateStr]) {
				acc[dateStr] = [];
			}
			acc[dateStr].push(workout);
			return acc;
		},
		{} as Record<string, WorkoutWithUser[]>,
	);
};

// Helper function to get user initials
const getUserInitials = (name: string | null | undefined): string => {
	if (!name) return "??";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
};

// Define search params type for admin page
interface AdminWorkoutsSearchParams {
	name?: string;
}

export default async function AdminWorkouts({
	searchParams,
}: {
	searchParams: Promise<AdminWorkoutsSearchParams>;
}) {
	const session = await auth();

	if (!session) {
		redirect("/auth/signin");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/");
	}

	const { name } = await Promise.resolve(searchParams);
	const currentFilter = name || "";

	// Fetch distinct names across all users
	const distinctNames = await getAllDistinctWorkoutNames();

	// Build the where clause for filtering
	const whereClause: Prisma.WorkoutWhereInput = {
		userId: {
			not: session.user.id, // Exclude workouts from the current admin
		},
		// Add name filtering logic
		...(currentFilter && {
			name: {
				equals: currentFilter,
				mode: "insensitive",
			},
		}),
	};

	// Fetch filtered workouts
	const workouts = await prisma.workout.findMany({
		where: whereClause,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
			_count: {
				select: { exercises: true },
			},
		},
		orderBy: {
			date: "desc",
		},
	});

	// Group filtered workouts
	const groupedWorkouts: Record<string, WorkoutWithUser[]> =
		groupWorkoutsByDate(workouts as WorkoutWithUser[]);
	const sortedDates = Object.keys(groupedWorkouts).sort((a, b) =>
		b.localeCompare(a),
	);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
				<h1 className="text-3xl font-bold">
					pnpm biome init{" "}
					{currentFilter ? `${currentFilter} Workouts` : "All User Workouts"}
				</h1>
				<div className="flex items-center gap-2">
					<WorkoutFilter
						distinctNames={distinctNames}
						currentFilter={currentFilter}
					/>
					<Link
						href="/workout/new"
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
					>
						Log New Workout
					</Link>
				</div>
			</div>

			{workouts.length === 0 ? (
				<p className="text-center text-muted-foreground mt-10">
					{currentFilter
						? `No '${currentFilter}' workouts found from users.`
						: "No workouts have been logged by users yet."}
				</p>
			) : (
				<Accordion type="multiple" className="w-full space-y-4">
					{sortedDates.map((dateStr) => (
						<AccordionItem
							key={dateStr}
							value={dateStr}
							className="border rounded-lg bg-card"
						>
							<AccordionTrigger className="px-6 py-4 hover:no-underline">
								<span className="text-lg font-medium">
									{format(new Date(dateStr), "EEEE, MMMM d, yyyy")}
								</span>
							</AccordionTrigger>
							<AccordionContent className="px-6 pb-4 pt-0">
								<div className="space-y-3">
									{groupedWorkouts[dateStr].map((workout) => (
										<Card key={workout.id} className="overflow-hidden">
											<CardHeader className="p-4 bg-muted/50">
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-3">
														<Avatar className="h-8 w-8">
															<AvatarImage
																src={workout.user.image ?? undefined}
																alt={workout.user.name ?? "User"}
															/>
															<AvatarFallback>
																{getUserInitials(workout.user.name)}
															</AvatarFallback>
														</Avatar>
														<div>
															<span className="font-medium">
																{workout.user.name || "Unnamed User"}
															</span>
															{workout.name && (
																<p className="text-xs text-muted-foreground">
																	{workout.name}
																</p>
															)}
														</div>
													</div>
													<Link href={`/workout/${workout.id}`}>
														<Button variant="outline" size="sm">
															View Details
														</Button>
													</Link>
												</div>
											</CardHeader>
											<CardContent className="p-4">
												<div className="flex items-center space-x-2 text-sm text-muted-foreground">
													<Dumbbell className="h-4 w-4" />
													<span>
														{workout._count.exercises}{" "}
														{workout._count.exercises === 1
															? "exercise"
															: "exercises"}
													</span>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</div>
	);
}
