import Link from "next/link";
import { Suspense } from "react";
import AuthErrorContent from "@/components/auth/AuthErrorContent";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <Suspense fallback={<LoadingFallback />}>
          <AuthErrorContent />
        </Suspense>
        <div className="mt-8 text-center">
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center">
      <p className="mt-6 text-3xl font-bold text-gray-900">Loading...</p>
      <p className="mt-2 text-sm text-gray-600">Checking error details...</p>
    </div>
  );
}
