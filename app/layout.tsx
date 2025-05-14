import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Cap M.Saleh - Training Progress Tracker",
	description: "Track your gym training progress and workouts with Cap M.Saleh",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					inter.className,
					"min-h-screen bg-background text-foreground",
				)}
			>
				<ThemeProvider>
					<SessionProvider>
						<div className="min-h-screen flex flex-col">
							<Navbar />
							<main className="flex-grow">
								<Suspense fallback={<Loading />}>
									{children}
								</Suspense>
							</main>
							<Footer />
						</div>
					</SessionProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
