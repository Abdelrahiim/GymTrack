import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { UserList } from "@/components/admin/UserList";
import { getUsers } from "@/actions/users";
import { Button } from "@/components/ui/button";
export default async function AdminUsers() {
	const session = await auth();

	// Check if user is authenticated and is an admin
	if (!session) {
		redirect("/auth/signin");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/");
	}

	// Get all users
	const { users } = await getUsers();

	// Filter out the current admin from the list
	const filteredUsers = users.filter((user) => user.id !== session.user.id);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Manage Users</h1>

				<Button size="lg" asChild>
					<Link href="/admin/users/new">Add New User</Link>
				</Button>
			</div>

			<div className="bg-white shadow rounded-lg overflow-hidden">
				<UserList users={filteredUsers} />
			</div>
		</div>
	);
}
