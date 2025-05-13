"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { Weight, Repeat, Activity } from "lucide-react";

interface ProgressDataPoint {
  date: string;
  weight: number;
  reps: number;
  volume: number;
  weightUnit?: string;
}

interface ExerciseProgressChartProps {
  exerciseNames: string[];
  exerciseProgressData: Record<string, ProgressDataPoint[]>;
  showMultipleExercises: boolean;
}

export function ExerciseProgressChart({ 
  exerciseNames, 
  exerciseProgressData, 
  showMultipleExercises
}: ExerciseProgressChartProps) {
  const [chartType, setChartType] = React.useState<"weight" | "reps" | "volume">("weight");
  
  // No data scenario
  if (exerciseNames.length === 0 || Object.keys(exerciseProgressData).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No progress data available
      </div>
    );
  }
  
  // Generate a color for each exercise (for multi-exercise charts)
  const getExerciseColor = (index: number) => {
    const colors = [
      "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
      "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
    ];
    return colors[index % colors.length];
  };

  const exerciseColors = exerciseNames.reduce<Record<string, string>>((colors, name, index) => {
    colors[name] = getExerciseColor(index);
    return colors;
  }, {});
  
  // Prepare data for the chart
  const prepareChartData = () => {
    if (showMultipleExercises) {
      // For multiple exercises: merge data points by date
      const dateMap = new Map<string, {
        date: string;
        formattedDate: string;
        [key: string]: string | number;
      }>();
      
      // Process each exercise
      for (const name of exerciseNames) {
        const data = exerciseProgressData[name] || [];
        
        // Add data points to the date map
        for (const point of data) {
          const dateKey = point.date;
          const formattedDate = new Date(point.date).toLocaleDateString();
          
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { date: dateKey, formattedDate });
          }
          
          // Add exercise-specific values
          const entry = dateMap.get(dateKey);
          if (entry) {
            entry[`${name}_weight`] = point.weight;
            entry[`${name}_reps`] = point.reps;
            entry[`${name}_volume`] = point.volume;
          }
        }
      }
      
      // Convert the map to an array and sort by date
      return Array.from(dateMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    // For single exercise: just format the data
    const exerciseName = exerciseNames[0];
    const data = exerciseProgressData[exerciseName] || [];
    
    return data.map(d => ({
      ...d,
      formattedDate: new Date(d.date).toLocaleDateString(),
    }));
  };
  
  const chartData = prepareChartData();
  
  // Chart configuration
  const chartTypeConfig = {
    weight: {
      label: "Weight",
      icon: Weight,
    },
    reps: {
      label: "Total Reps",
      suffix: "",
      icon: Repeat,
    },
    volume: {
      label: "Volume",
      icon: Activity,
    },
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <Tabs defaultValue="weight" className="w-full h-full" onValueChange={(value) => setChartType(value as "weight" | "reps" | "volume")}>
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="weight" className="flex items-center gap-1">
              <Weight className="h-3.5 w-3.5" />
              Weight
            </TabsTrigger>
            <TabsTrigger value="reps" className="flex items-center gap-1">
              <Repeat className="h-3.5 w-3.5" />
              Reps
            </TabsTrigger>
            <TabsTrigger value="volume" className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              Volume
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 w-full h-[90%]">
          {["weight", "reps", "volume"].map((type) => (
            <TabsContent key={type} value={type} className="h-full w-full mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, 'auto']}
                    label={{ 
                      value: type === "reps" 
                        ? chartTypeConfig[type as keyof typeof chartTypeConfig].label
                        : (() => {
                            // For weight/volume, find the most common unit
                            if (showMultipleExercises) {
                              // Aggregate all units across exercises
                              const allUnits: Record<string, number> = {};
                              for (const name of exerciseNames) {
                                const exerciseData = exerciseProgressData[name] || [];
                                for (const point of exerciseData) {
                                  if (point.weightUnit) {
                                    allUnits[point.weightUnit] = (allUnits[point.weightUnit] || 0) + 1;
                                  }
                                }
                              }
                              // Find the most common unit
                              const mostCommonUnit = Object.entries(allUnits)
                                .sort((a, b) => b[1] - a[1])[0]?.[0] || "";
                              return `${chartTypeConfig[type as keyof typeof chartTypeConfig].label}${mostCommonUnit ? ` (${mostCommonUnit})` : ""}`;
                            }
                            
                            // For single exercise, use the first available unit
                            const exerciseName = exerciseNames[0];
                            const exerciseData = exerciseProgressData[exerciseName] || [];
                            const dataPointWithUnit = exerciseData.find(point => point.weightUnit);
                            const unit = dataPointWithUnit?.weightUnit || "";
                            return `${chartTypeConfig[type as keyof typeof chartTypeConfig].label}${unit ? ` (${unit})` : ""}`;
                          })(), 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: '8px',
                      fontSize: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                    formatter={(value: number, name: string) => {
                      // Extract the actual exercise name from the dataKey
                      let exerciseName = name;
                      let metricType = type;
                      let weightUnit = "";
                      
                      if (showMultipleExercises) {
                        const parts = name.split('_');
                        if (parts.length === 2) {
                          exerciseName = parts[0];
                          metricType = parts[1];
                        }
                      }
                      
                      // Get weight unit for the exercise
                      if (metricType === "weight" || metricType === "volume") {
                        // Find the most recent data point for this exercise that has a weight unit
                        const exerciseData = exerciseProgressData[exerciseName] || [];
                        const dataPointWithUnit = exerciseData.find(point => point.weightUnit);
                        weightUnit = dataPointWithUnit?.weightUnit || "";
                      }
                      
                      const suffix = metricType === "reps" ? "" : (weightUnit || "");
                      return [`${value}${suffix ? ` ${suffix}` : ""}`, exerciseName];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  
                  {showMultipleExercises ? (
                    // Multiple exercise lines
                    exerciseNames.map((name, index) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={`${name}_${type}`}
                        name={name}
                        stroke={exerciseColors[name]}
                        strokeWidth={2}
                        dot={{ r: 4, fill: exerciseColors[name] }}
                        activeDot={{ r: 6 }}
                        connectNulls
                        isAnimationActive={true}
                      />
                    ))
                  ) : (
                    // Single exercise line
                    <Line
                      type="monotone"
                      dataKey={type}
                      name={exerciseNames[0]}
                      stroke={exerciseColors[exerciseNames[0]]}
                      fill={exerciseColors[exerciseNames[0]]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
} 