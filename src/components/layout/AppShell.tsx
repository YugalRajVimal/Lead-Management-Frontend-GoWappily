
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

// Define palette colors for easy reuse
const PALETTE = {
  blue: "#2E93D6",
  orange: "#F2591C",
  navy: "#0B2C5F",
  lightBlue: "#F3F8FB", // Very light blue background
  lightNavy: "#E9EFF6", // Very light navy/grayish bg fallback
  loaderBg: "#F3F8FB",
};

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${PALETTE.lightBlue} 0%, ${PALETTE.lightNavy} 100%)` }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-4"
          style={{
            borderColor: `${PALETTE.blue}22`, // transparentized blue for subtlety
            borderTopColor: PALETTE.orange,
            borderRightColor: PALETTE.navy,
            borderBottomColor: `${PALETTE.blue}22`,
            borderLeftColor: `${PALETTE.blue}22`,
          }}
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="flex h-screen"
      style={{
        background: `linear-gradient(135deg, ${PALETTE.lightBlue} 60%, ${PALETTE.lightNavy} 100%)`
      }}
    >
      <Sidebar
        /* You might want to style your Sidebar separately for palette sync */
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          title={title}
          /* You might want to update Header internals for palette sync */
        />
        <main
          className="flex-1 overflow-y-auto pb-16 md:pb-0"
          style={{
            background: "transparent",
            color: PALETTE.navy,
          }}
        >
          {children}
        </main>
      </div>
      <MobileNav
        /* You might want to style your MobileNav for palette sync */
      />
    </div>
  );
}