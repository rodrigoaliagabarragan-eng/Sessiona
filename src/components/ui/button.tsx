import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-400",
  secondary:
    "bg-white text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50 focus-visible:ring-ink-300",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-100 focus-visible:ring-ink-300",
  danger:
    "bg-rose/80 text-ink-900 hover:bg-rose focus-visible:ring-rose"
};

export function buttonVariants(
  variant: NonNullable<ButtonProps["variant"]> = "primary",
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonVariants(variant, className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
