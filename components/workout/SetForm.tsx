import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type {
	UseFormRegister,
	Control,
	ControllerRenderProps,
	UseFormGetValues,
	UseFormSetValue,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import type { WorkoutFormValues } from "@/lib/validations/workout";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { WeightUnit } from "@/lib/generated/prisma/client";

const weightUnits: WeightUnit[] = [
	WeightUnit.KG,
	WeightUnit.LB,
	WeightUnit.PLATES,
];

// Helper function to render unit labels properly
const formatWeightUnitLabel = (unit: WeightUnit): string => {
	switch (unit) {
		case WeightUnit.KG:
			return "Kilograms";
		case WeightUnit.LB:
			return "Pounds";
		case WeightUnit.PLATES:
			return "Plates";
		default:
			return unit;
	}
};

interface SetFormProps {
	exerciseIndex: number;
	setIndex: number;
	register: UseFormRegister<WorkoutFormValues>;
	control: Control<WorkoutFormValues>;
	removeSet: (index: number) => void;
	canRemove: boolean;
	getValues: UseFormGetValues<WorkoutFormValues>;
	setValue: UseFormSetValue<WorkoutFormValues>;
}

export function SetForm({
	exerciseIndex,
	setIndex,
	register,
	control,
	removeSet,
	canRemove,
	getValues,
	setValue,
}: SetFormProps) {
	const weightFieldName =
		`exercises.${exerciseIndex}.sets.${setIndex}.weight` as const;
	const unitFieldName =
		`exercises.${exerciseIndex}.sets.${setIndex}.weightUnit` as const;
		
	// Propagate unit change to all sets in this exercise when unit changes
	const propagateUnitChange = (newUnit: WeightUnit) => {
		// Get current exercise
		const exercises = getValues("exercises");
		const currentExercise = exercises?.[exerciseIndex];
		
		if (currentExercise?.sets) {
			// Update all sets with the same unit
			currentExercise.sets.forEach((_, idx) => {
				if (idx !== setIndex) { // Skip current set as it's already updated
					setValue(
						`exercises.${exerciseIndex}.sets.${idx}.weightUnit` as const,
						newUnit
					);
				}
			});
		}
	};

	return (
		<Card className="shadow-sm border">
			<CardContent className="p-2 xs:p-3 sm:p-4">
				<div className="flex flex-col xs:flex-row items-start xs:items-end justify-between gap-2 xs:gap-3 sm:gap-4">
					<div className="font-medium text-xs xs:text-sm sm:text-base whitespace-nowrap">
						Set {setIndex + 1}
					</div>
					<div className="flex flex-wrap items-end justify-end gap-2 w-full xs:w-auto">
						<div className="flex flex-col gap-1">
							<label
								htmlFor={`${unitFieldName}-reps`}
								className="text-[10px] xs:text-xs text-muted-foreground"
							>
								Reps
							</label>
							<Input
								id={`${unitFieldName}-reps`}
								type="number"
								min="0"
								placeholder="0"
								{...register(
									`exercises.${exerciseIndex}.sets.${setIndex}.reps`,
									{ valueAsNumber: true },
								)}
								className="w-16 xs:w-20 h-8 xs:h-9 text-xs xs:text-sm px-2"
								aria-label={`Repetitions for set ${setIndex + 1}`}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label
								htmlFor={weightFieldName}
								className="text-[10px] xs:text-xs text-muted-foreground"
							>
								Amount
							</label>
							<Input
								id={weightFieldName}
								type="number"
								min="0"
								step="0.5"
								placeholder="0"
								{...register(weightFieldName, { valueAsNumber: true })}
								className="w-16 xs:w-20 h-8 xs:h-9 text-xs xs:text-sm px-2"
								aria-label={`Weight amount for set ${setIndex + 1}`}
							/>
						</div>
						<Controller
							control={control}
							name={unitFieldName}
							defaultValue={WeightUnit.KG}
							render={({
								field,
							}: {
								field: ControllerRenderProps<
									WorkoutFormValues,
									typeof unitFieldName
								>;
							}) => (
								<div className="flex flex-col gap-1">
									<label
										htmlFor={unitFieldName}
										className="text-[10px] xs:text-xs text-muted-foreground"
									>
										Unit
									</label>
									<Select
										onValueChange={(value) => {
											field.onChange(value);
											// Update other sets in this exercise to match
											propagateUnitChange(value as WeightUnit);
										}}
										value={field.value ?? WeightUnit.KG}
									>
										<SelectTrigger
											id={unitFieldName}
											className="w-[80px] xs:w-[100px] h-8 xs:h-9 text-xs xs:text-sm px-2"
										>
											<SelectValue placeholder="Unit" />
										</SelectTrigger>
										<SelectContent>
											{weightUnits.map((unit) => (
												<SelectItem 
													key={unit} 
													value={unit}
													className="text-xs xs:text-sm"
												>
													{formatWeightUnitLabel(unit)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						/>
						{canRemove && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => removeSet(setIndex)}
								className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 self-end mb-0.5 h-8 xs:h-9 w-8 xs:w-9"
								aria-label={`Remove set ${setIndex + 1}`}
							>
								<Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
