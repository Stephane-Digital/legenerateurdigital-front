"use client";

export default function SkeletonLine({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`
        h-4 w-full
        bg-gradient-to-br from-[#1c1c1c] to-[#111]
        rounded-md
        animate-pulse
        ${className}
      `}
    />
  );
}
