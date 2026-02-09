"use client";
import * as React from "react";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      className={[
        "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-black/15 focus:border-gray-300",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
