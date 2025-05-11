"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registerUser } from "@/actions/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { signIn } from "next-auth/react";

export function SignUpForm() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: SignUpFormData) => {
		try {
			const formData = new FormData();
			formData.append("email", data.email);
			formData.append("password", data.password);
			formData.append("name", data.name);
			formData.append("confirm-password", data.confirmPassword);

			console.log("Submitting registration data:", {
				email: data.email,
				name: data.name,
				// Don't log password for security
			});

			const result = await registerUser(formData);
			console.log("Registration result:", result);

			if (result.error) {
				toast.error(result.error);
				return;
			}

			console.log("Registration successful, attempting sign in");
			
			// Wait a moment before trying to sign in to ensure the database has updated
			await new Promise(resolve => setTimeout(resolve, 500));
			
			console.log("Attempting sign in after registration");
			const signInResult = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
				callbackUrl: "/"
			});
			console.log("Sign in result:", signInResult);

			if (signInResult?.error) {
				console.error("Auto sign-in failed:", signInResult.error);
				toast.success("Account created! Please sign in manually.");
				router.push("/auth/signin");
				return;
			}

			toast.success("Account created and signed in successfully!");
			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Registration error:", error);
			toast.error("Something went wrong. Please try again.");
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder="Enter your name"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="Enter your email address"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										{...field}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
										<span className="sr-only">
											{showPassword ? "Hide password" : "Show password"}
										</span>
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Confirm your password"
										{...field}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
										<span className="sr-only">
											{showConfirmPassword ? "Hide password" : "Show password"}
										</span>
									</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="w-full"
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating account...
						</>
					) : (
						"Sign Up"
					)}
				</Button>
			</form>
		</Form>
	);
}
