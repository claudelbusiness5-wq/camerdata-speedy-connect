import type { ReactNode } from "react";

export function Marquee({
  items,
  duration = 35,
  className = "",
}: {
  items: ReactNode[];
  duration?: number;
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="animate-marquee flex w-max items-center gap-10"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
