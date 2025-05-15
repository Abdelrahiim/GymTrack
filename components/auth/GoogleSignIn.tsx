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
				redirect: true,
				callbackUrl: "/",
			});
		} catch (error) {
			console.error("Google sign in error:", error);
			toast.error("An unexpected error occurred. Please try again.");
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
