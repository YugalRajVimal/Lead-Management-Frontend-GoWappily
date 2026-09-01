// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/useAuth";
// import { Sidebar } from "./Sidebar";
// import { Header } from "./Header";
// import { MobileNav } from "./MobileNav";

// export function AppShell({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) {
//       router.replace("/login/");
//     }
//   }, [loading, user, router]);

//   if (loading) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-slate-50">
//         <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
//     <div className="flex h-screen bg-slate-50">
//       <Sidebar />
//       <div className="flex flex-1 flex-col min-w-0">
//         <Header title={title} />
//         <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
//       </div>
//       <MobileNav />
//     </div>
//   );
// }


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#DCE9F7] border-t-[#1C6FC9]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}