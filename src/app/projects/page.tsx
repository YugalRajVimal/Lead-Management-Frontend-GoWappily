"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ProjectsContent } from "./ProjectsContent";

// Split into a thin Suspense wrapper + ProjectsContent because Epic 4 added
// an optional ?teamMember=<id> preset (from the Team page's "View projects"
// links), which needs useSearchParams() — same pattern as the detail pages.
export default function ProjectsPage() {
  return (
    <AppShell title="Projects">
      <Suspense fallback={<div className="p-4 md:p-6"><TableSkeleton rows={8} cols={6} /></div>}>
        <ProjectsContent />
      </Suspense>
    </AppShell>
  );
}
