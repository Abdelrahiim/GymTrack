"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import type { Level, WorkoutDay } from "@/lib/generated/prisma/client";
import {
	levelFormSchema,
	type LevelFormValues,
} from "@/lib/validations/levels";
import { updateLevelAction } from "@/actions/levels";

interface LevelWithWorkoutDays extends Level {
	workoutDays: WorkoutDay[];
}

export function UpdateLevelDialog({
	level: initialLevelData,
	userId,
}: {
	level: LevelWithWorkoutDays;
	userId: string;
}) {
	const [open, setOpen] = useState(false);

	const prepareDefaultWorkoutDays = (levelData: LevelWithWorkoutDays) => {
		const targetDays = levelData.daysPerWeek || 0;
		const existingDays = levelData.workoutDays || [];
		const defaultDays = [];
		for (let i = 0; i < targetDays; i++) {
			defaultDays.push({
				name: existingDays[i]?.name || "",
				description: existingDays[i]?.description || "",
			});
		}
		return defaultDays;
	};

	const form = useForm<LevelFormValues>({
		resolver: zodResolver(levelFormSchema),
		defaultValues: {
			name: initialLevelData.name,
			description: initialLevelData.description || "",
			daysPerWeek: initialLevelData.daysPerWeek,
			workoutDays: prepareDefaultWorkoutDays(initialLevelData),
		},
	});

	const { fields, replace } = useFieldArray({
		control: form.control,
		name: "workoutDays",
	});

	const daysPerWeek = form.watch("daysPerWeek");

	useEffect(() => {
		const currentWorkoutDays = form.getValues("workoutDays") || [];
		const targetDaysCount = daysPerWeek || 0;
		const newWorkoutDays = [];

		for (let i = 0; i < targetDaysCount; i++) {
			newWorkoutDays.push(
				currentWorkoutDays[i] || { name: "", description: "" },
			);
		}
		replace(newWorkoutDays);
	}, [daysPerWeek, form, replace]);

	const onSubmit = async (data: LevelFormValues) => {
		const finalData = {
			...data,
			workoutDays: data.workoutDays
				?.slice(0, data.daysPerWeek || 0)
				.map((day, index) => ({
					...day,
					dayNumber: index + 1,
				})),
		};

		const result = await updateLevelAction(
			initialLevelData.id,
			userId,
			finalData,
		);

		if (result.success) {
			toast.success("Level updated successfully");
			setOpen(false);
		} else {
			toast.error(result.error || "Failed to update level");
		}
	};

	const resetFormAndClose = () => {
		form.reset({
			name: initialLevelData.name,
			description: initialLevelData.description || "",
			daysPerWeek: initialLevelData.daysPerWeek,
			workoutDays: prepareDefaultWorkoutDays(initialLevelData),
		});
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				if (!isOpen) {
					form.reset({
						name: initialLevelData.name,
						description: initialLevelData.description || "",
						daysPerWeek: initialLevelData.daysPerWeek,
						workoutDays: prepareDefaultWorkoutDays(initialLevelData),
					});
				}
			}}
		>
			<DialogTrigger asChild>
				<Button size="sm" variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Edit level</span>
					<Edit className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Level</DialogTitle>
					<DialogDescription>
						Update this training level's details, including its workout days.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Level Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Phase 1: Foundation" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Level Description (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe the focus of this level..."
											className="resize-none"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="daysPerWeek"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Days Per Week</FormLabel>
									<Select
										onValueChange={(value) => {
											field.onChange(Number.parseInt(value));
										}}
										defaultValue={field.value?.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select days" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{[1, 2, 3, 4, 5, 6, 7].map((day) => (
												<SelectItem key={day} value={day.toString()}>
													{day} {day === 1 ? "day" : "days"}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Number of workout days per week for this level.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{fields.map((item, index) => (
							<div key={item.id} className="p-4 border rounded-md space-y-3">
								<h4 className="font-medium text-md">Workout Day {index + 1}</h4>
								<FormField
									control={form.control}
									name={`workoutDays.${index}.name` as const}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Day Name</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Chest & Triceps" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={`workoutDays.${index}.description` as const}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Day Description (Optional)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Focus, main lifts, etc."
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						))}
						<DialogFooter className="mt-6">
							<DialogClose asChild>
								<Button
									type="button"
									variant="outline"
									onClick={resetFormAndClose}
								>
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
