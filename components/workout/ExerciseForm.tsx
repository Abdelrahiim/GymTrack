import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { SetForm } from "./SetForm";
import {
	type Control,
	type UseFormRegister,
	useFieldArray,
	type UseFormGetValues,
	type UseFormSetValue,
} from "react-hook-form";
import type { WorkoutFormValues } from "@/lib/validations/workout";
import { WeightUnit } from "@/lib/generated/prisma/client";
interface ExerciseFormProps {
	control: Control<WorkoutFormValues>;
	register: UseFormRegister<WorkoutFormValues>;
	exerciseIndex: number;
	removeExercise: (index: number) => void;
	canRemove: boolean;
	getValues: UseFormGetValues<WorkoutFormValues>;
	setValue: UseFormSetValue<WorkoutFormValues>;
}

export function ExerciseForm({
	control,
	register,
	exerciseIndex,
	removeExercise,
	canRemove,
}: ExerciseFormProps) {
	const {
		fields: setFields,
		append: appendSet,
		remove: removeSet,
	} = useFieldArray({
		control,
		name: `exercises.${exerciseIndex}.sets`,
		keyName: "fieldId",
	});

	return (
		<Card className="overflow-hidden">
			<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-4 pb-2 sm:pb-3">
				<div className="flex-1 w-full sm:w-auto">
					<Input
						placeholder="Exercise Name (e.g., Bench Press)"
						{...register(`exercises.${exerciseIndex}.name`)}
						className="text-base sm:text-lg font-semibold"
					/>
				</div>
				{canRemove && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => removeExercise(exerciseIndex)}
						className="text-destructive hover:text-destructive/90 self-end sm:self-center ml-auto sm:ml-0"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
			</CardHeader>
			<CardContent className="p-3 sm:p-4 pt-2 sm:pt-3 space-y-3 sm:space-y-4">
				<div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
					<h3 className="text-sm sm:text-base font-medium text-muted-foreground">
						Sets
					</h3>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							appendSet({ reps: 10, weight: 0, weightUnit: WeightUnit.KG })
						}
						className="gap-1 sm:gap-1.5 w-full xs:w-auto text-xs sm:text-sm whitespace-nowrap"
					>
						<Plus className="h-3 w-3.5 sm:h-3.5 sm:w-3.5" />
						Add Set
					</Button>
				</div>
				<div className="space-y-2 sm:space-y-3">
					{setFields.map((setField, setIndex) => (
						<SetForm
							key={setField.fieldId}
							exerciseIndex={exerciseIndex}
							setIndex={setIndex}
							register={register}
							control={control}
							removeSet={removeSet}
							canRemove={setFields.length > 1}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
