

"use client";

import { Suspense } from "react";
import { LeadDetailContent } from "./LeadDetailContent";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LeadDetailPage() {
  return (
    <AppShell title="Lead Detail">
      <Suspense
        fallback={
          <div className="p-6 space-y-3 max-w-4xl">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        <LeadDetailContent />
      </Suspense>
    </AppShell>
  );
}