"use client";

import * as React from "react";

function cx(...v: Array<string | undefined | false | null>) {
  return v.filter(Boolean).join(" ");
}

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Avatar({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-yellow-500/20 bg-black/40",
          className
        )}
        {...props}
      />
    );
  }
);

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <img
      ref={ref}
      className={cx("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
});

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cx(
        "flex h-full w-full items-center justify-center bg-yellow-500/10 text-yellow-200 text-sm font-semibold",
        className
      )}
      {...props}
    />
  );
});
