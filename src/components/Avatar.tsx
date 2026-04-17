import React from "react";

// ============================================================
// Type Definitions with Literal Unions for Autocomplete
// ============================================================

/** Available avatar sizes (Tailwind width classes) */
export type AvatarSize = "w-8" | "w-10" | "w-12" | "w-14" | "w-16" | "w-20" | "w-24";

/** Available indicator statuses */
export type AvatarIndicator = "online" | "offline" | "placeholder" | "none";

/** Available ring colors (Tailwind ring color classes) */
export type AvatarRingColor = "ring-primary" | "ring-secondary" | "ring-accent" | "ring-guinda" | "ring-guinda-dark" | "bg-guinda-claro";

/** Available ring offset colors */
export type AvatarRingOffset = "ring-offset-base-100" | "ring-offset-base-200" | "ring-offset-base-300" | "ring-offset-white";

/** Available border radius options */
export type AvatarRounded = "rounded-none" | "rounded-sm" | "rounded-md" | "rounded-lg" | "rounded-xl" | "rounded-full";

/** Available background colors (Tailwind background classes) */
export type AvatarBgColor =
   | "bg-neutral"
   | "bg-primary"
   | "bg-secondary"
   | "bg-accent"
   | "bg-guinda"
   | "bg-guinda-dark"
   | "bg-guinda-claro"
   | "bg-guinda-claro2"
   | "bg-gris-cool"
   | "bg-gris"
   | "bg-negro";

/** Available text colors (Tailwind text classes) */
export type AvatarTextColor = "text-neutral-content" | "text-white" | "text-black" | "text-gris" | "text-guinda";

// ============================================================
// Component Props Interface
// ============================================================
export interface AvatarProps {
   /** Image source URL. If not provided, children or placeholder will be shown */
   src?: string;
   /** Alternative text for the image (default: 'avatar') */
   alt?: string;
   /** Custom content inside the avatar (e.g., initials, icon) */
   children?: React.ReactNode;
   /** Status indicator badge */
   indicator?: AvatarIndicator;
   /** Avatar size (Tailwind width class) */
   size?: AvatarSize;
   /** Whether to show a ring around the avatar */
   ring?: boolean;
   /** Ring color (only applies if ring=true) */
   ringColor?: AvatarRingColor;
   /** Ring offset color (only applies if ring=true) */
   ringOffset?: AvatarRingOffset;
   /** Border radius style */
   rounded?: AvatarRounded;
   /** Background color for placeholder (when no image or children) */
   bgColor?: AvatarBgColor;
   /** Text color for placeholder content */
   textColor?: AvatarTextColor;
}

// ============================================================
// Component
// ============================================================
const Avatar: React.FC<AvatarProps> = ({
   src,
   alt = "avatar",
   children,
   indicator = "none",
   size = "w-12",
   ring = false,
   ringColor = "ring-guinda-claro",
   ringOffset = "ring-offset-base-100",
   rounded = "rounded-full",
   bgColor = "bg-guinda-claro2",
   textColor = "text-neutral-content"
}) => {
   // Determine the outer avatar class with indicator
   const outerClass = `avatar ${indicator !== "none" ? `avatar-${indicator}` : ""}`;

   // Inner div classes
   const innerClass = [ring && ringColor, ring && ringOffset, ring && "ring-2", size, rounded, bgColor, textColor].filter(Boolean).join(" ");

   // If image source is provided, render image
   if (src) {
      return (
         <div className={outerClass}>
            <div className={`${innerClass} p-1.5`}>
               <img src={src} alt={alt} />
            </div>
         </div>
      );
   }

   // If children are provided (e.g., initials), render them as placeholder
   if (children) {
      return (
         <div className={outerClass}>
            <div className={`${innerClass} flex items-center justify-center`}>
               <span className="text-base font-black">{children}</span>
            </div>
         </div>
      );
   }

   // Fallback: empty avatar with placeholder background
   return (
      <div className={outerClass}>
         <div className={`${innerClass} flex items-center justify-center`}>
            <span className="text-base font-medium">👤</span>
         </div>
      </div>
   );
};

export default Avatar;
