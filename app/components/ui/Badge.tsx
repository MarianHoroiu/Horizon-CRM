"use client";

import React from "react";

interface BadgeProps {
  text: string;
  variant?: "default" | "outline" | "contact" | "user";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Badge({
  text,
  variant = "default",
  size = "md",
  icon,
}: BadgeProps) {
  // Base classes for all badge variants
  const baseClasses = "inline-flex items-center rounded-full font-medium";

  // Size-specific classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  // Variant-specific classes
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    outline: "bg-white text-gray-700 border border-gray-300",
    contact: "bg-indigo-100 text-indigo-800",
    user: "bg-emerald-100 text-emerald-800",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </span>
  );
}
