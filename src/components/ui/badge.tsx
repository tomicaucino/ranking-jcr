import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type Tone = "green" | "gold" | "gray" | "red" | "blue";

const toneClasses: Record<Tone, string> = {
  green: "bg-primary-100 text-primary-700",
  gold: "bg-accent-400/20 text-accent-600",
  gray: "bg-black/5 text-muted",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
};

export function Badge({
  tone = "gray",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
