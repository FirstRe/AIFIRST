"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "glass", children, ...props }, ref) => {
    const variants = {
      default: "bg-white shadow-lg",
      glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-b border-white/10 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-6 ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = "CardContent";
