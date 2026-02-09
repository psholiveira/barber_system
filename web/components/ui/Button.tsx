"use client";
import * as React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const v: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-black/90",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent hover:bg-gray-100",
};
const s: Record<Size, string> = { sm: "h-9 px-3 text-sm", md: "h-10 px-4 text-sm" };

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
) {
  const { className = "", variant = "primary", size = "md", ...rest } = props;
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-xl font-medium transition",
        "focus:outline-none focus:ring-2 focus:ring-black/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        v[variant],
        s[size],
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
