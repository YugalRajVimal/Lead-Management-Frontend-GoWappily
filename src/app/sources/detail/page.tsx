"use client";

import { Suspense } from "react";
import { SourceDetailContent } from "./SourceDetailContent";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";

// Custom skeleton with logo palette colors
function StyledSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={className}
   
    />
  );
}

export default function SourceDetailPage() {
  return (
    <AppShell
      title="Source Detail"
    >
      <Suspense
        fallback={
          <div
            className="p-6 space-y-3 rounded-lg"
            style={{
              background: "linear-gradient(135deg, #2E93D6 0%, #F2591C 100%)",
              border: "2px solid #2E93D6",
              boxShadow: "0 4px 24px 0 rgba(46,147,214,0.10), 0 1.5px 8px 0 #F2591C38",
            }}
          >
            <StyledSkeleton className="h-6 w-48 rounded" />
            <StyledSkeleton className="h-48 w-full rounded-md" />
          </div>
        }
      >
        <div
          className=""
      
        >
          <SourceDetailContent />
        </div>
      </Suspense>
    </AppShell>
  );
}
