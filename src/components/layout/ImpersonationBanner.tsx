"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function ImpersonationBanner() {
  const { impersonation, user, exitImpersonation } = useAuth();
  if (!impersonation || !user) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-amber-400 px-4 py-1.5 text-xs font-medium text-amber-950 shrink-0">
      <span>
        Viewing as <strong>{user.name}</strong> ({user.role.replace("_", " ")})
      </span>
      <button
        onClick={() => exitImpersonation()}
        className="flex items-center gap-1 rounded bg-amber-950/10 px-2 py-0.5 hover:bg-amber-950/20"
      >
        <LogOut className="h-3 w-3" /> Exit
      </button>
    </div>
  );
}
