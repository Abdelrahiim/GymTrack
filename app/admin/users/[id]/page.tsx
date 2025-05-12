import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns"; // For date formatting
import {
	User as UserIcon,
	ShieldCheck,
	ArrowUpCircle,
	ArrowDownCircle,
	CalendarDays,
	Mail,
	Shield,
	ListChecks, // For days per week
	BookOpen, // For description
	Target,
	Info,
} from "lucide-react";
import type {
	User as PrismaUser,
	Level as PrismaLevel,
	Role,
	WorkoutDay,
} from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache"; // Added for server actions
import { CreateLevelDialog } from "@/components/admin/CreateLevelDialog"; // New import
import { UpdateLevelDialog } from "@/components/admin/UpdateLevelDialog"; // New import
import { DeleteLevelDialog } from "@/components/admin/DeleteLevelDialog"; // New import
import { LevelChangeForm } from "@/components/admin/LevelChangeForm"; // New import
import { handlePromote, handleDemote } from "@/actions/userActions";

// Helper function to get initials from name
const getInitials = (name?: string | null) => {
	if (!name) return "U";
	const names = name.split(" ");
	if (names.length === 1) return names[0][0].toUpperCase();
	return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

type UserPageProps = {
	params: Promise<{
		id: string;
	}>;
};

// Assuming PrismaUser includes assignedLevelId: string | null and other necessary scalar fields.
// Role enum is directly imported and used.
interface AppUser extends PrismaUser {
	// Directly use PrismaUser, assuming it has assignedLevelId
	// We'll add fetched related data to this structure later if needed,
	// or handle it separately in the component.
}

// Interface for Level with WorkoutDays included
interface LevelWithWorkoutDays extends PrismaLevel {
	workoutDays: WorkoutDay[];
}

// Interface for the data passed to the page component, including fetched relationshandlePromote
interface EnrichedUserPageData extends AppUser {
	currentLevelData: LevelWithWorkoutDays | null;
	userLevelsData: LevelWithWorkoutDays[];
}

export default async function UserPage({ params }: UserPageProps) {
	const userId = (await params).id;

	const basicUser = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!basicUser) {
		notFound();
	}

	let currentLevelData: LevelWithWorkoutDays | null = null;
	if (basicUser.currentLevelId) {
		currentLevelData = await prisma.level.findUnique({
			where: { id: basicUser.currentLevelId },
			include: { workoutDays: true },
		}) as LevelWithWorkoutDays;
	}

	const userLevelsData: LevelWithWorkoutDays[] = await prisma.level.findMany({
		where: { userId: basicUser.id }, // Levels created by/for this user
		orderBy: { name: "asc" },
		include: { workoutDays: true },
	}) as LevelWithWorkoutDays[];

	// Construct the object for the page, ensuring correct typing
	const user: EnrichedUserPageData = {
		...basicUser,
		email: basicUser.email ?? null, // Ensure nullable fields are explicitly null if undefined
		name: basicUser.name ?? null,
		image: basicUser.image ?? null,
		emailVerified: basicUser.emailVerified ?? null,
		password: basicUser.password ?? null, // Should not be used in UI legacyBehavior={false}but part of PrismaUser
		currentLevelId: basicUser.currentLevelId ?? null, // Ensure currentLevelId is part of PrismaUser and thus spread correctly
		role: basicUser.role as Role, // Cast if PrismaUser.role is just string
		createdAt: new Date(basicUser.createdAt), // Ensure it's a Date object
		currentLevelData,
		userLevelsData,
	};

	const totalUserLevels = user.userLevelsData.length;

	return (
		<div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
			<Card className="max-w-2xl mx-auto">
				<CardHeader className="pb-4">
					<div className="flex items-center space-x-4">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src={user.image ?? undefined}
								alt={user.name ?? "User"}
							/>
							<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className="text-2xl">
								{user.name || "Unnamed User"}
							</CardTitle>
							<CardDescription className="flex items-center text-sm text-muted-foreground">
								<Mail className="mr-1.5 h-4 w-4" /> {user.email || "No email"}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div className="space-y-1">
							<p className="text-muted-foreground flex items-center">
								<UserIcon className="mr-1.5 h-4 w-4" /> User ID
							</p>
							<p className="font-mono text-xs">{user.id}</p>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground flex items-center">
								<Shield className="mr-1.5 h-4 w-4" /> Role
							</p>
							<Badge
								variant={user.role === "ADMIN" ? "destructive" : "secondary"}
							>
								{user.role}
							</Badge>
						</div>
						<div className="space-y-1">
							<p className="text-muted-foreground flex items-center">
								<CalendarDays className="mr-1.5 h-4 w-4" /> Joined
							</p>
							<p>{format(user.createdAt, "PPP")}</p>
						</div>
						{user.emailVerified && (
							<div className="space-y-1">
								<p className="text-muted-foreground flex items-center">
									<ShieldCheck className="mr-1.5 h-4 w-4 text-green-500" />{" "}
									Email Verified
								</p>
								<p>{format(new Date(user.emailVerified), "PPP")}</p>
							</div>
						)}
					</div>

					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold mb-2">Level Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div className="space-y-1">
								<p className="text-muted-foreground">Current Level</p>
								<p>
									{user.currentLevelData
										? user.currentLevelData.name
										: "Not Assigned"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground">
									Total Levels Created/Assigned to User
								</p>
								<p>{totalUserLevels}</p>
							</div>
						</div>
						{/* Still need clarification from user on "how many levels he should have" */}
					</div>
				</CardContent>
				<CardFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
					<LevelChangeForm user={{
						id: user.id,
						currentLevelId: user.currentLevelId,
						userLevelsData: user.userLevelsData
					}} />
				</CardFooter>
			</Card>

			{/* Section for Managing User's Levels */}
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle>Manage User's Levels</CardTitle>
						<CreateLevelDialog userId={user.id} />
					</div>
				</CardHeader>
				<CardContent>
					{user.userLevelsData.length === 0 ? (
						<p className="text-muted-foreground text-center py-4">This user currently has no levels.</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{user.userLevelsData.map((level) => (
								<Card key={level.id} className="flex flex-col">
									<CardHeader className="pb-2">
										<CardTitle className="text-lg">{level.name}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3 text-sm flex-grow">
										{level.description && (
											<p className="text-muted-foreground flex items-start text-xs">
												<BookOpen className="mr-1.5 h-3.5 w-3.5 shrink-0 mt-0.5" /> 
												<span>{level.description}</span>
											</p>
										)}
										<p className="text-muted-foreground flex items-center text-xs">
											<ListChecks className="mr-1.5 h-3.5 w-3.5" /> 
											Days per week: {level.daysPerWeek}
										</p>
										{level.workoutDays && level.workoutDays.length > 0 && (
											<div className="pt-2 mt-2 border-t border-dashed">
												<h4 className="text-xs font-semibold mb-1.5 text-foreground">Workout Days:</h4>
												<ul className="space-y-1.5">
													{level.workoutDays.map((day) => (
														<li key={day.id} className="text-xs text-muted-foreground">
															<p className="flex items-center">
																<Target className="mr-1.5 h-3.5 w-3.5 shrink-0" />
																<strong className="text-foreground mr-1">{day.name}:</strong>
															</p>
															{day.description && (
																<p className="pl-5 flex items-start">
																	<Info className="mr-1.5 h-3.5 w-3.5 shrink-0 mt-0.5" />
																	<span>{day.description}</span>
																</p>
															)}
														</li>
													))}
												</ul>
											</div>
										)}
									</CardContent>
									<CardFooter className="flex justify-end gap-2 pt-4 border-t">
										<UpdateLevelDialog level={level} userId={user.id} />
										<DeleteLevelDialog level={level} userId={user.id} />
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
