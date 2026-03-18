"use client";

import SkeletonBox from "./SkeletonBox";
import SkeletonLine from "./SkeletonLine";

export default function SkeletonDayCard() {
  return (
    <div
      className="
        bg-[#131313]
        border border-[#1f1f1f]
        rounded-2xl
        p-8
        flex flex-col
        gap-6
      "
    >
      <SkeletonLine className="w-1/3 h-6" />
      <SkeletonLine className="w-1/2 h-5" />

      <SkeletonBox className="h-24 rounded-xl" />
      <SkeletonBox className="h-20 rounded-xl" />

      <SkeletonLine className="w-1/3 h-4" />
    </div>
  );
}
