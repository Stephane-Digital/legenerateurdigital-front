"use client";

export default function SkeletonBox({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`
        bg-gradient-to-br from-[#1c1c1c] to-[#111]
        rounded-xl
        animate-pulse
        ${className}
      `}
    />
  );
}
