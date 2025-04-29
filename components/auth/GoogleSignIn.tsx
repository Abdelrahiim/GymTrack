"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GoogleSignInProps {
  isSignUp?: boolean;
}

export function GoogleSignIn({ isSignUp = false }: GoogleSignInProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { 
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      toast.error("Something went wrong with Google sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGoogleSignIn}
      className="w-full"
      disabled={isLoading}
    >
      <Image 
        src="/google-logo.svg" 
        alt="Google Logo" 
        width={20} 
        height={20}
        className="mr-2"
      />
      {isSignUp ? "Sign up with Google" : "Sign in with Google"}
    </Button>
  );
} 