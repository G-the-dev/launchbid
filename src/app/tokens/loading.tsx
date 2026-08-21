import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg space-y-4 pt-12">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-5 w-80 max-w-full" />
      <SkeletonBlock className="h-24 w-full" />
      <SkeletonBlock className="h-40 w-full" />
      <SkeletonBlock className="h-40 w-full" />
    </div>
  );
}
