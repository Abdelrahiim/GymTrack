import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { SetForm } from "./SetForm";

interface ExerciseFormProps {
  exerciseIndex: number;
  name: string;
  sets: Array<{ reps: number; weight: number }>;
  onNameChange: (value: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onSetChange: (setIndex: number, field: "reps" | "weight", value: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function ExerciseForm({
  exerciseIndex,
  name,
  sets,
  onNameChange,
  onAddSet,
  onRemoveSet,
  onSetChange,
  onRemove,
  canRemove,
}: ExerciseFormProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex-1">
          <Input
            placeholder="Exercise Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="text-xl font-semibold"
          />
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
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
            onClick={onAddSet}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Set
          </Button>
        </div>
        <div className="space-y-2">
          {sets.map((set, setIndex) => (
            <SetForm
              key={setIndex}
              setIndex={setIndex}
              reps={set.reps}
              weight={set.weight}
              onRepsChange={(value) => onSetChange(setIndex, "reps", value)}
              onWeightChange={(value) => onSetChange(setIndex, "weight", value)}
              onRemove={() => onRemoveSet(setIndex)}
              canRemove={sets.length > 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 