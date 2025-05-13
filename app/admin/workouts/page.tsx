import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, ChevronRight, Dumbbell, ListFilter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default async function AdminWorkouts({
	searchParams,
}: {
	searchParams: { search?: string };
}) {
	const session = await auth();

	if (!session) {
		redirect("/auth/signin");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/");
	}

	const search = searchParams.search || "";

	// Fetch all users with their workout data and current level
	const users = await prisma.user.findMany({
		where: {
			id: { not: session.user.id }, // Exclude current admin
			role: { not: "ADMIN" }, // Exclude other admins
			...(search && {
				OR: [
					{ name: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
				],
			}),
		},
		include: {
			levels: {
				include: {
					workoutDays: true,
				},
			},
			workouts: {
				orderBy: {
					date: "desc",
				},
				take: 1, // Get most recent workout
			},
			_count: {
				select: { 
					workouts: true,
				},
			},
		},
		orderBy: [
			{ 
				name: "asc",
			},
		],
	});

	// Get users' workout stats
	const userStats = await Promise.all(
		users.map(async (user) => {
			const totalExercises = await prisma.exercise.count({
				where: {
					workout: {
						userId: user.id,
					},
				},
			});

			return {
				userId: user.id,
				totalExercises,
			};
		})
	);

	// Combine user data with stats
	const usersWithStats = users.map(user => {
		const stats = userStats.find(stat => stat.userId === user.id);
		const currentLevel = user.levels.find(level => level.id === user.currentLevelId);
		
		return {
			...user,
			totalExercises: stats?.totalExercises || 0,
			currentLevel,
			lastWorkoutDate: user.workouts[0]?.date || null,
		};
	});

	return (
		<div className="container max-w-7xl mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6 space-y-6">
			{/* Header Section */}
			<div className="border-b pb-4 sm:pb-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
							User Management
						</h1>
					</div>
					
					<div className="flex flex-col sm:flex-row gap-2">
						<form className="flex w-full max-w-sm items-center space-x-2">
							<Input
								type="search"
								placeholder="Search users..."
								name="search"
								defaultValue={search}
								className="h-9"
							/>
							<Button type="submit" size="sm" className="h-9">
								<ListFilter className="h-4 w-4 mr-2" />
								Filter
							</Button>
						</form>
					</div>
				</div>
			</div>

			{/* Users Count */}
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-muted-foreground">
					{usersWithStats.length} {usersWithStats.length === 1 ? 'user' : 'users'} found
				</div>
			</div>

			{/* Users Card Grid - All Devices */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{usersWithStats.length === 0 ? (
					<Card className="col-span-full bg-muted/10 border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-6 text-center">
							<p className="text-muted-foreground mb-2">No users found</p>
						</CardContent>
					</Card>
				) : (
					usersWithStats.map((user) => (
						<Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
							<CardHeader className="pb-2 px-4">
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage src={user.image || undefined} alt={user.name || "User"} />
											<AvatarFallback>
												{user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{user.name || "Unnamed User"}</p>
											<p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="px-4 pt-0 pb-4 space-y-4">
								<div className="flex flex-wrap items-center gap-2 mt-2">
									{user.currentLevel ? (
										<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
											{user.currentLevel.name}
										</Badge>
									) : (
										<span className="text-xs text-muted-foreground">No level assigned</span>
									)}
								</div>
								
								<div className="grid grid-cols-2 gap-3">
									<div className="bg-muted/20 rounded-md p-2 flex flex-col">
										<span className="text-xs text-muted-foreground">Workouts</span>
										<div className="flex items-center mt-1">
											<Dumbbell className="h-3.5 w-3.5 text-primary mr-1.5" />
											<span className="font-medium">{user._count.workouts}</span>
										</div>
									</div>
									<div className="bg-muted/20 rounded-md p-2 flex flex-col">
										<span className="text-xs text-muted-foreground">Exercises</span>
										<div className="flex items-center mt-1">
											<BarChart className="h-3.5 w-3.5 text-primary mr-1.5" />
											<span className="font-medium">{user.totalExercises}</span>
										</div>
									</div>
								</div>
								
								<div className="flex items-center justify-between pt-2 border-t">
									<div className="text-xs text-muted-foreground">
										{user.lastWorkoutDate ? (
											<span>Last active: {format(new Date(user.lastWorkoutDate), "MMM d, yyyy")}</span>
										) : (
											<span>Never active</span>
										)}
									</div>
									<Link href={`/admin/workouts/${user.id}`}>
										<Button variant="outline" size="sm" className="gap-1">
											Details 
											<ChevronRight className="h-3.5 w-3.5" />
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
