"use client";

import * as React from "react";

function cx(...v: Array<string | undefined | false | null>) {
  return v.filter(Boolean).join(" ");
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/40 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<string, string> = {
  default: "bg-[#ffb800] text-black hover:brightness-110",
  outline:
    "border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-500/15",
  ghost: "bg-transparent text-yellow-200 hover:bg-yellow-500/10",
};

const sizes: Record<string, string> = {
  default: "h-11 px-4",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
