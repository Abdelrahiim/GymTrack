import { Spinner } from "./spinner";

export function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <Spinner size="lg" />
    </div>
  );
} 