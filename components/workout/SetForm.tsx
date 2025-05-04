import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type { UseFormRegister, Control, ControllerRenderProps } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { WorkoutFormValues } from "./WorkoutForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeightUnit } from "@/lib/generated/prisma/client";

const weightUnits: WeightUnit[] = [WeightUnit.KG, WeightUnit.LB, WeightUnit.PLATES];

interface SetFormProps {
  exerciseIndex: number;
  setIndex: number;
  register: UseFormRegister<WorkoutFormValues>;
  control: Control<WorkoutFormValues>;
  removeSet: (index: number) => void;
  canRemove: boolean;
}

export function SetForm({
  exerciseIndex,
  setIndex,
  register,
  control,
  removeSet,
  canRemove,
}: SetFormProps) {
  const weightFieldName = `exercises.${exerciseIndex}.sets.${setIndex}.weight` as const;
  const unitFieldName = `exercises.${exerciseIndex}.sets.${setIndex}.weightUnit` as const;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-end justify-between gap-2">
          <div className="font-medium whitespace-nowrap">Set {setIndex + 1}</div>
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${unitFieldName}-reps`} className="text-xs text-muted-foreground">Reps</label>
              <Input
                id={`${unitFieldName}-reps`}
                type="number"
                min="0"
                placeholder="0"
                {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, { valueAsNumber: true })}
                className="w-16 sm:w-20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={weightFieldName} className="text-xs text-muted-foreground">Amount</label>
              <Input
                id={weightFieldName}
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                {...register(weightFieldName, { valueAsNumber: true })}
                className="w-16 sm:w-20"
              />
            </div>
            <Controller
              control={control}
              name={unitFieldName}
              defaultValue={WeightUnit.KG}
              render={({ field }: { field: ControllerRenderProps<WorkoutFormValues, typeof unitFieldName> }) => (
                <div className="flex flex-col gap-1">
                  <label htmlFor={unitFieldName} className="text-xs text-muted-foreground">Unit</label>
                  <Select onValueChange={field.onChange} value={field.value ?? WeightUnit.KG}>
                    <SelectTrigger id={unitFieldName} className="w-[90px] sm:w-[100px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {weightUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
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
                className="text-destructive hover:text-destructive/90 mb-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
