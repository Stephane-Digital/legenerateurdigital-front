"use client";

import SkeletonBox from "./SkeletonBox";
import SkeletonLine from "./SkeletonLine";

export default function SkeletonWeekColumn() {
  return (
    <div
      className="
        bg-[#131313]
        border border-[#1f1f1f]
        rounded-2xl
        p-5
        flex flex-col
        gap-4
      "
    >
      <SkeletonLine className="w-1/3 h-5" />
      <SkeletonLine className="w-1/2 h-4" />
      <SkeletonBox className="h-16 rounded-xl" />
      <SkeletonLine className="w-3/4 h-4" />
      <SkeletonLine className="w-full h-4" />
    </div>
  );
}
