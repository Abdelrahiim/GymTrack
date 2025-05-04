import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <ShieldAlert className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary">403</h1>
        <h2 className="text-2xl font-semibold">Access Forbidden</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <div className="pt-4 space-x-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}