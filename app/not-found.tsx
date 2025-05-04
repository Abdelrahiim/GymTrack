import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
			<div className="text-center space-y-4">
				<h1 className="text-6xl font-bold text-primary">404</h1>
				<h2 className="text-2xl font-semibold">Page Not Found</h2>
				<p className="text-muted-foreground">
					The page you are looking for does not exist or has been moved.
				</p>
				<div className="pt-4">
					<Button asChild>
						<Link href="/">Return Home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
