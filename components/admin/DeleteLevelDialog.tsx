"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Level } from "@/lib/generated/prisma/client";
import { deleteLevelAction } from "@/actions/levels";

export function DeleteLevelDialog({
	level,
	userId,
}: { level: Level; userId: string }) {
	const [open, setOpen] = useState(false);

	const handleDelete = async () => {
		const result = await deleteLevelAction(level.id, userId);

		if (result.success) {
			toast.success("Level deleted successfully");
			setOpen(false);
		} else {
			toast.error(result.error || "Failed to delete level");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					size="sm"
					variant="ghost"
					className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
				>
					<span className="sr-only">Delete level</span>
					<Trash2 className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Delete Level</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the level: "{level.name}"? This
						action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</DialogClose>
					<Button type="button" variant="destructive" onClick={handleDelete}>
						Delete Level
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
