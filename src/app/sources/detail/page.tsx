"use client";

import { Suspense } from "react";
import { SourceDetailContent } from "./SourceDetailContent";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SourceDetailPage() {
  return (
    <AppShell title="Source Detail">
      <Suspense
        fallback={
          <div className="p-6 space-y-3 max-w-3xl">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-48 w-full" />
          </div>
        }
      >
        <SourceDetailContent />
      </Suspense>
    </AppShell>
  );
}
