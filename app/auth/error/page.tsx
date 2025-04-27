"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Authentication Error</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error === "AccessDenied" 
              ? "You do not have access to this resource."
              : "An error occurred during authentication."}
          </p>
        </div>
        <div className="mt-8">
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
} 