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
	getValues,
	setValue,
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

	// Get current weight unit from the first set (if exists)
	const getCurrentWeightUnit = () => {
		const exercises = getValues("exercises");
		if (
			exercises && 
			exercises[exerciseIndex]?.sets?.length > 0
		) {
			return exercises[exerciseIndex].sets[0].weightUnit || WeightUnit.KG;
		}
		return WeightUnit.KG;
	};

	return (
		<Card className="overflow-hidden shadow-sm border">
			<CardHeader className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center justify-between gap-2 p-3 xs:p-3.5 sm:p-4 pb-2 sm:pb-3">
				<div className="flex-1 w-full xs:w-auto">
					<Input
						placeholder="Exercise Name (e.g., Bench Press)"
						{...register(`exercises.${exerciseIndex}.name`)}
						className="text-sm xs:text-base sm:text-lg font-semibold min-h-9 w-full"
						aria-label="Exercise name"
					/>
				</div>
				{canRemove && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => removeExercise(exerciseIndex)}
						className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 self-end xs:self-center sm:self-center ml-auto xs:ml-0 h-9 w-9"
						aria-label="Remove exercise"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
			</CardHeader>
			<CardContent className="p-3 xs:p-3.5 sm:p-4 pt-2 xs:pt-2.5 sm:pt-3 space-y-3 xs:space-y-3.5 sm:space-y-4">
				<div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
					<h3 className="text-xs xs:text-sm sm:text-base font-medium text-muted-foreground">
						Sets
					</h3>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							appendSet({ 
								reps: 10, 
								weight: 0, 
								weightUnit: getCurrentWeightUnit() 
							})
						}
						className="gap-1 xs:gap-1.5 sm:gap-1.5 w-full xs:w-auto text-xs xs:text-xs sm:text-sm whitespace-nowrap min-h-8 h-auto py-1.5"
					>
						<Plus className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3.5 sm:w-3.5" />
						Add Set
					</Button>
				</div>
				<div className="space-y-2 xs:space-y-2.5 sm:space-y-3">
					{setFields.map((setField, setIndex) => (
						<SetForm
							key={setField.fieldId}
							exerciseIndex={exerciseIndex}
							setIndex={setIndex}
							register={register}
							control={control}
							removeSet={removeSet}
							canRemove={setFields.length > 1}
							getValues={getValues}
							setValue={setValue}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
