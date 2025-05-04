import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";

export default function AuthPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex justify-center mb-4">
						<div className="bg-blue-600 p-3 rounded-full">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-10 w-10 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Cap M.Saleh Logo</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
					</div>
					<CardTitle className="text-2xl text-center">Cap M.Saleh</CardTitle>
					<CardDescription className="text-center">
						Track your fitness journey
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Tabs defaultValue="signin" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="signin">Sign In</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>
						<TabsContent value="signin" className="space-y-4">
							<SignInForm />
							<div className="relative w-full">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>
							<GoogleSignIn isSignUp={false} />
						</TabsContent>
						<TabsContent value="signup" className="space-y-4">
							<SignUpForm />
							<div className="relative w-full">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>
							<GoogleSignIn isSignUp={true} />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
