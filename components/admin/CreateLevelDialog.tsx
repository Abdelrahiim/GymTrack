"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { PlusCircle } from "lucide-react";
import {
	levelFormSchema,
	type LevelFormValues,
} from "@/lib/validations/levels";
import { createLevelAction } from "@/actions/levels";

export function CreateLevelDialog({ userId }: { userId: string }) {
	const [open, setOpen] = useState(false);

	const form = useForm<LevelFormValues>({
		resolver: zodResolver(levelFormSchema),
		defaultValues: {
			name: "",
			description: "",
			daysPerWeek: 3,
			workoutDays: Array(3).fill({ name: "", description: "" }),
		},
	});

	const { fields, append, remove, replace } = useFieldArray({
		control: form.control,
		name: "workoutDays",
	});

	const daysPerWeek = form.watch("daysPerWeek");

	useEffect(() => {
		const currentWorkoutDaysCount = fields.length;
		const targetDays = daysPerWeek || 0;
		if (currentWorkoutDaysCount !== targetDays) {
			const newWorkoutDays = Array(targetDays)
				.fill(null)
				.map((_, i) => {
					return fields[i] || { name: "", description: "" };
				});
			replace(newWorkoutDays);
		}
	}, [daysPerWeek, fields, replace]);

	const onSubmit = async (data: LevelFormValues) => {
		const finalData = {
			...data,
			workoutDays: data.workoutDays?.slice(0, data.daysPerWeek || 0),
		};

		const result = await createLevelAction(userId, finalData);
		if (result.success) {
			toast.success("Level created successfully");
			setOpen(false);
			form.reset({
				name: "",
				description: "",
				daysPerWeek: 3,
				workoutDays: Array(3).fill({ name: "", description: "" }),
			});
		} else {
			toast.error(result.error || "Failed to create level");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				if (!isOpen) {
					form.reset({
						name: "",
						description: "",
						daysPerWeek: 3,
						workoutDays: Array(3).fill({ name: "", description: "" }),
					});
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex gap-2 items-center">
					<PlusCircle className="h-4 w-4" /> Create Level
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Level</DialogTitle>
					<DialogDescription>
						Add a new training level for this user, including specific workout
						days.
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
											const numValue = Number.parseInt(value);
											field.onChange(numValue);
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
									onClick={() => {
										form.reset({
											name: "",
											description: "",
											daysPerWeek: 3,
											workoutDays: Array(3).fill({ name: "", description: "" }),
										});
										setOpen(false);
									}}
								>
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Creating..." : "Create Level"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
