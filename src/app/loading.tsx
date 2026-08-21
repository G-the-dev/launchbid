import { SkeletonBoard, SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="pt-14">
      <div className="py-10 text-center">
        <SkeletonBlock className="mx-auto h-10 w-80 max-w-full" />
        <SkeletonBlock className="mx-auto mt-4 h-5 w-96 max-w-full" />
        <SkeletonBlock className="mx-auto mt-7 h-11 w-64 max-w-full" />
      </div>
      <SkeletonBlock className="mx-auto mt-2 h-20 w-full max-w-xl" />
      <div className="mt-14">
        <SkeletonBlock className="mb-4 h-6 w-32" />
        <SkeletonBoard />
      </div>
    </div>
  );
}
