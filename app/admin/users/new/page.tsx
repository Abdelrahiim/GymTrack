import { auth } from "@/auth"; // Use server-side auth helper
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewUserForm } from "@/components/admin/NewUserForm"; // Import the client form component

// No need for schema or form types here anymore

// Page is now an async Server Component
export default async function NewUserPage() {
  const session = await auth();

  // Perform auth check on the server
  if (!session || session.user.role !== "ADMIN") {
    redirect("/"); // Or redirect to an unauthorized page
    // Note: No return null needed after redirect in Server Components
  }

  // Render the layout and the client form component
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center mb-6">
        <Link
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 mr-4"
        >
          ← Back to Users
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Add New User</h1>
      </div>

      {/* Render the client component */}
      <NewUserForm />

    </div>
  );
}
