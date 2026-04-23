"use client";

import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8e5e0]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#111111] disabled:pointer-events-none disabled:opacity-40",
          {
            "border border-[#e8e5e0]/20 bg-transparent text-[#e8e5e0] hover:bg-[#e8e5e0]/5": variant === "primary",
            "border border-[#333] bg-[#1a1a1a] text-[#999] hover:bg-[#222] hover:text-[#e8e5e0]": variant === "secondary",
            "border border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/5": variant === "danger",
            "text-[#888] hover:text-[#e8e5e0] hover:bg-[#1a1a1a]": variant === "ghost",
          },
          {
            "h-8 px-4 text-xs": size === "sm",
            "h-10 px-5 text-sm": size === "md",
            "h-12 px-6 text-sm": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
