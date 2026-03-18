"use client";

import SkeletonBox from "./SkeletonBox";
import SkeletonLine from "./SkeletonLine";

export default function SkeletonSidebarCard() {
  return (
    <div
      className="
        bg-[#131313]
        border border-[#1f1f1f]
        rounded-2xl
        p-6
        flex flex-col
        gap-4
      "
    >
      <SkeletonLine className="w-1/2 h-5" />
      <SkeletonBox className="h-20 rounded-xl" />
      <SkeletonLine className="w-3/4 h-4" />
      <SkeletonLine className="w-2/3 h-4" />
    </div>
  );
}
