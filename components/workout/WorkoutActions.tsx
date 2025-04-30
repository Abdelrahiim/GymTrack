import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WorkoutActionsProps {
  loading: boolean;
  onCancel?: () => void;
}

export function WorkoutActions({ loading, onCancel }: WorkoutActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel || (() => router.push("/"))}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
            Saving...
          </div>
        ) : (
          "Save Workout"
        )}
      </Button>
    </div>
  );
} 