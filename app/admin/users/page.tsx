import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { UserList } from "@/components/admin/UserList";
import { getUsers } from "@/app/actions/users";

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
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New User
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <UserList users={users} />
      </div>
    </div>
  );
} 