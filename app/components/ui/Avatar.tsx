"use client";

import React from "react";
import { Tooltip } from "./Tooltip";

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  tooltipContent?: React.ReactNode;
}

export function Avatar({
  firstName,
  lastName,
  size = "md",
  tooltipContent,
}: AvatarProps) {
  // Generate initials from name
  const initials = `${firstName?.[0] || ""}${
    lastName?.[0] || ""
  }`.toUpperCase();

  // Determine avatar size based on prop
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  // Generate a consistent background color based on name
  const getBackgroundColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    // Use the sum of character codes to select a color
    const charSum = `${firstName}${lastName}`
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return colors[charSum % colors.length];
  };

  const avatarElement = (
    <div
      className={`${sizeClasses[size]} ${getBackgroundColor()} 
        rounded-full flex items-center justify-center text-white font-medium`}>
      {initials}
    </div>
  );

  if (tooltipContent) {
    return <Tooltip content={tooltipContent}>{avatarElement}</Tooltip>;
  }

  return avatarElement;
}
