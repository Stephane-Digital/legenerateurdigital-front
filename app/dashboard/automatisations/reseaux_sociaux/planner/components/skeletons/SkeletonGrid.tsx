"use client";

import SkeletonBox from "./SkeletonBox";

export default function SkeletonGrid() {
  return (
    <div className="grid grid-cols-7 gap-3 sm:gap-4">
      {Array.from({ length: 42 }).map((_, i) => (
        <SkeletonBox key={i} className="h-[95px] sm:h-[110px] rounded-xl" />
      ))}
    </div>
  );
}
