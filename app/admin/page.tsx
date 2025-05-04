import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, BarChart3 } from "lucide-react";

export default async function AdminDashboard() {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Link href="/admin/users">
					<Card className="hover:shadow-lg transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								User Management
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Manage user accounts, roles, and permissions
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/admin/workouts">
					<Card className="hover:shadow-lg transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								User Workouts
							</CardTitle>
							<Dumbbell className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								View and manage user workout data
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/admin/progress">
					<Card className="hover:shadow-lg transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Progress Analytics
							</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								View user progress and analytics
							</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}
