import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface WorkoutHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
}

export function WorkoutHeader({ 
  title, 
  description, 
  backHref = "/workout" 
}: WorkoutHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        {backHref && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 h-8"
            asChild
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
} 