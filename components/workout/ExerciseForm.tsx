import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { SetForm } from "./SetForm";
import { Control, UseFormRegister, useFieldArray, FieldErrors, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { WorkoutFormValues } from "./WorkoutForm";

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
  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
    keyName: "fieldId"
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex-1">
          <Input
            placeholder="Exercise Name"
            {...register(`exercises.${exerciseIndex}.name`)}
            className="text-xl font-semibold"
          />
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeExercise(exerciseIndex)}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Sets</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSet({ reps: undefined, weight: undefined })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Set
          </Button>
        </div>
        <div className="space-y-2">
          {setFields.map((setField, setIndex) => (
            <SetForm
              key={setField.fieldId}
              exerciseIndex={exerciseIndex}
              setIndex={setIndex}
              register={register}
              removeSet={removeSet}
              canRemove={setFields.length > 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 