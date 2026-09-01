import { cn } from "@/lib/utils";

// Use light tints of the palette: 
// #2E93D6 (blue), #F2591C (orange), #0B2C5F (navy).
// We'll make very light backgrounds for skeletons.

const SKELETON_BG = "bg-[#e6f1fa]";       // very light blue from #2E93D6
const SKELETON_ALT_BG = "bg-[#faefe6]";   // very light orange from #F2591C
const SKELETON_BORDER = "border-[#dbe9f5]"; // lighter navy/blue border

export function Skeleton({ className, color = "blue" }: { className?: string; color?: "blue" | "orange" }) {
  // color prop lets you theme by blue or orange per skeleton
  const bg =
    color === "orange"
      ? SKELETON_ALT_BG
      : SKELETON_BG;
  return (
    <div className={cn("animate-pulse rounded-md", bg, className)} />
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  // Alternate row colors for some palette variety & visual interest
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={cn(
            "flex gap-4 border-b px-4 py-3",
            SKELETON_BORDER
          )}
          style={{
            background:
              r % 2 === 0 ? "#e6f1fa" : "#faefe6"
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-4 flex-1"
              color={r % 2 === 0 ? "blue" : "orange"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  // Card body: light blue; elements alternate blue/orange
  return (
    <div className={cn(
      "rounded-lg border p-4",
      SKELETON_BORDER,
      "bg-[#f8fafc]" // a subtle off-white with very light blue
    )}>
      <Skeleton className="h-3 w-20 mb-3" color="blue" />
      <Skeleton className="h-7 w-16" color="orange" />
    </div>
  );
}