// import { cn } from "@/lib/utils";
// import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from "react";

// export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
//   ({ className, ...props }, ref) => (
//     <input
//       ref={ref}
//       className={cn(
//         "w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400",
//         className
//       )}
//       {...props}
//     />
//   )
// );
// Input.displayName = "Input";

// export const Textarea = forwardRef<
//   HTMLTextAreaElement,
//   TextareaHTMLAttributes<HTMLTextAreaElement>
// >(({ className, ...props }, ref) => (
//   <textarea
//     ref={ref}
//     className={cn(
//       "w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400",
//       className
//     )}
//     {...props}
//   />
// ));
// Textarea.displayName = "Textarea";

// export function Label({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <label className={cn("mb-1 block text-xs font-medium text-slate-600", className)}>
//       {children}
//     </label>
//   );
// }


import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#2E93D6] focus:ring-2 focus:ring-[#2E93D6]/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#2E93D6] focus:ring-2 focus:ring-[#2E93D6]/15",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("mb-1 block text-xs font-medium text-slate-600", className)}>
      {children}
    </label>
  );
}