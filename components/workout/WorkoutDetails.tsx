import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Control } from "react-hook-form";
import type { WorkoutFormValues } from "@/lib/validations/workout";

// Extended form values that include date
interface ExtendedWorkoutFormValues extends WorkoutFormValues {
	date: string;
}

interface WorkoutDetailsProps {
	control: Control<ExtendedWorkoutFormValues>;
}

export function WorkoutDetails({ control }: WorkoutDetailsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Workout Details</CardTitle>
			</CardHeader>
			<CardContent>
				<FormField
					control={control}
					name="date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Workout Date</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
