import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 pt-12">
      <div className="flex items-start gap-4">
        <SkeletonBlock className="size-14 shrink-0 rounded-none" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-7 w-56 max-w-full" />
          <SkeletonBlock className="h-4 w-80 max-w-full" />
        </div>
      </div>
      <SkeletonBlock className="h-20 w-full" />
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}
