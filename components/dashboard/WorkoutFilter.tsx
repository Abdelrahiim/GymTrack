'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface WorkoutFilterProps {
  distinctNames: string[];
  currentFilter: string;
}

export function WorkoutFilter({ distinctNames, currentFilter }: WorkoutFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value || value === 'all') {
      current.delete('name');
    } else {
      current.set('name', value);
    }

    // Reset page number if needed in the future
    // current.delete('page');

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleFilterChange} value={currentFilter || 'all'}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by name..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Workouts</SelectItem>
          {distinctNames.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentFilter && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFilterChange('all')}
            title="Clear filter"
          >
              <X className="h-4 w-4" />
          </Button>
      )}
    </div>
  );
} 