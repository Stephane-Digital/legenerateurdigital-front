"use client";

import SkeletonLine from "./SkeletonLine";

export default function SkeletonBlock() {
  return (
    <div
      className="
        bg-[#131313]
        border border-[#1e1e1e]
        rounded-2xl
        p-6
        flex flex-col
        gap-4
        shadow-sm shadow-black/40
      "
    >
      <SkeletonLine className="w-1/2 h-5" />
      <SkeletonLine className="w-3/4" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-2/3" />
      <SkeletonLine className="w-4/5" />
    </div>
  );
}
