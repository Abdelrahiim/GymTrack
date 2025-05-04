import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface WorkoutActionsProps {
	loading: boolean;
	onCancel?: () => void;
	cancelHref?: string;
	submitText?: string;
}

export function WorkoutActions({
	loading,
	onCancel,
	cancelHref,
	submitText = "Save Workout",
}: WorkoutActionsProps) {
	const router = useRouter();

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else if (cancelHref) {
			router.push(cancelHref);
		} else {
			router.push("/");
		}
	};

	return (
		<div className="flex flex-col sm:flex-row gap-4 justify-end">
			{cancelHref ? (
				<Button
					type="button"
					variant="outline"
					className="w-full sm:w-auto"
					asChild
				>
					<Link href={cancelHref}>Cancel</Link>
				</Button>
			) : (
				<Button
					type="button"
					variant="outline"
					onClick={handleCancel}
					className="w-full sm:w-auto"
				>
					Cancel
				</Button>
			)}

			<Button type="submit" className="w-full sm:w-auto" disabled={loading}>
				{loading ? (
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
						Saving...
					</div>
				) : (
					submitText
				)}
			</Button>
		</div>
	);
}
