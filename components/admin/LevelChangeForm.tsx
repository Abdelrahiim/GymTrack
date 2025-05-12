"use client";

import { handlePromote, handleDemote } from "@/actions/userActions";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

type User = {
	id: string;
	currentLevelId: string | null;
	userLevelsData: { id: string }[];
};

export function LevelChangeForm({ user }: { user: User }) {
	const [isPendingPromote, startPromoteTransition] = useTransition();
	const [isPendingDemote, startDemoteTransition] = useTransition();

	const onPromote = () => {
		startPromoteTransition(async () => {
			try {
				await handlePromote(user.id, user.currentLevelId, user.userLevelsData);
				toast.success("User promoted successfully");
			} catch (error) {
				toast.error("Failed to promote user");
			}
		});
	};

	const onDemote = () => {
		startDemoteTransition(async () => {
			try {
				await handleDemote(user.id, user.currentLevelId, user.userLevelsData);
				toast.success("User demoted successfully");
			} catch (error) {
				toast.error("Failed to demote user");
			}
		});
	};

	const isHighestLevel = 
		user.userLevelsData.length === 0 ||
		(!!user.currentLevelId &&
			user.userLevelsData.length > 0 &&
			user.currentLevelId === user.userLevelsData[user.userLevelsData.length - 1].id);

	return (
		<>
			<form className="w-full sm:w-auto" action={onPromote}>
				<Button
					type="submit"
					className="w-full sm:w-auto flex items-center"
					disabled={isHighestLevel || isPendingPromote}
				>
					{isPendingPromote ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<ArrowUpCircle className="mr-2 h-4 w-4" />
					)}
					{isPendingPromote ? "Promoting..." : "Promote"}
				</Button>
			</form>
			<form className="w-full sm:w-auto" action={onDemote}>
				<Button
					type="submit"
					variant="outline"
					className="w-full sm:w-auto flex items-center"
					disabled={!user.currentLevelId || isPendingDemote}
				>
					{isPendingDemote ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<ArrowDownCircle className="mr-2 h-4 w-4" />
					)}
					{isPendingDemote ? "Demoting..." : "Demote"}
				</Button>
			</form>
		</>
	);
}
