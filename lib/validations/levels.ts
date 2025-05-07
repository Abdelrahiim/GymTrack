import * as z from "zod";

export const workoutDaySchema = z.object({
	// No need for dayNumber here, it will be derived from array index
	name: z.string().min(1, "Workout day name is required"),
	description: z.string().optional(),
});

export const levelFormSchema = z.object({
	name: z.string().min(1, "Level name is required"),
	description: z.string().optional(),
	daysPerWeek: z.coerce
		.number()
		.int("Days per week must be a whole number")
		.min(1, "Minimum 1 day per week")
		.max(7, "Maximum 7 days per week"),
	workoutDays: z.array(workoutDaySchema).optional(), // Add workoutDays array
});

export type LevelFormValues = z.infer<typeof levelFormSchema>;
export type WorkoutDayFormValues = z.infer<typeof workoutDaySchema>; // Export workout day type 