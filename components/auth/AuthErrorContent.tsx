'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Map common NextAuth errors to user-friendly messages
  const errorMessages: { [key: string]: string } = {
    Configuration: 'Server configuration error. Please contact support.',
    AccessDenied: 'Access Denied. You do not have permission to sign in or access this page.',
    Verification: 'The sign in link is no longer valid. It may have been used already or expired.',
    Default: 'An unexpected error occurred during authentication. Please try again.',
  };

  const message = error ? (errorMessages[error] ?? errorMessages.Default) : errorMessages.Default;

  return (
    <div className="text-center">
      <h2 className="mt-6 text-3xl font-bold text-destructive">Authentication Error</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
} 