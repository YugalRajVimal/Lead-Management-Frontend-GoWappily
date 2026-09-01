// import { cn } from "@/lib/utils";
// import { SelectHTMLAttributes, forwardRef } from "react";

// export const Select = forwardRef<
//   HTMLSelectElement,
//   SelectHTMLAttributes<HTMLSelectElement>
// >(({ className, children, ...props }, ref) => (
//   <select
//     ref={ref}
//     className={cn(
//       "w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white",
//       className
//     )}
//     {...props}
//   >
//     {children}
//   </select>
// ));
// Select.displayName = "Select";

import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#2E93D6] focus:ring-2 focus:ring-[#2E93D6]/15 bg-white",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";