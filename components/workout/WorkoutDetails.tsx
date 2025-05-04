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
import type { WorkoutFormValues } from "./WorkoutForm";

interface WorkoutDetailsProps {
  control: Control<WorkoutFormValues>;
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
