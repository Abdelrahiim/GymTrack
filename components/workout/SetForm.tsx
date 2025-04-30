import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface SetFormProps {
  setIndex: number;
  reps: number;
  weight: number;
  onRepsChange: (value: number) => void;
  onWeightChange: (value: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SetForm({
  setIndex,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onRemove,
  canRemove,
}: SetFormProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="font-medium">Set {setIndex + 1}</div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">Reps</label>
              <Input
                type="number"
                min="0"
                value={reps}
                onChange={(e) => onRepsChange(parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">Weight (kg)</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={weight}
                onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
                className="w-20"
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 