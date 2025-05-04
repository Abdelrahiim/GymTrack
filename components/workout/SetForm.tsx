import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { WorkoutFormValues } from "./WorkoutForm";

interface SetFormProps {
  exerciseIndex: number;
  setIndex: number;
  register: UseFormRegister<WorkoutFormValues>;
  removeSet: (index: number) => void;
  canRemove: boolean;
}

export function SetForm({
  exerciseIndex,
  setIndex,
  register,
  removeSet,
  canRemove,
}: SetFormProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="font-medium">Set {setIndex + 1}</div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
                className="text-sm text-muted-foreground"
              >
                Reps
              </label>
              <Input
                id={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
                type="number"
                min="0"
                placeholder="0"
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.reps`,
                  { valueAsNumber: true }
                )}
                className="w-20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
                className="text-sm text-muted-foreground"
              >
                Weight (kg)
              </label>
              <Input
                id={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.weight`,
                  { valueAsNumber: true }
                )}
                className="w-20"
              />
            </div>
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSet(setIndex)}
                className="text-destructive hover:text-destructive/90 self-end"
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
