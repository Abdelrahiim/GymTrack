import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface WorkoutHeaderProps {
  title: string;
}

export function WorkoutHeader({ title }: WorkoutHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
    </div>
  );
} 