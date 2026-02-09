import * as React from "react";

export function Card({
  title,
  right,
  children,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {title ? (
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {right}
        </header>
      ) : null}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
