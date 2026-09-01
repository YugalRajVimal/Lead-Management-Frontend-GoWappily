import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/hooks/useToast";

export const metadata: Metadata = {
  title: "GoWappily — Lead Management",
  description: "Lead tracking for leads imported from Google Sheets",
};

// Root color vars for palette: #2E93D6 (blue), #F2591C (orange), #0B2C5F (navy)

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{
      // Fallback color for "background" – navy
      background: "#0B2C5F"
    }}>
      <body
        className="font-sans antialiased"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #2E93D6 0%, #F2591C 100%)",
          color: "#0B2C5F",
          // Better readability on top of gradients
          fontWeight: 400,
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            background: "rgba(255,255,255,0.85)",
            borderRadius: "0 0 18px 18px",
            boxShadow: "0 2px 20px 0 rgba(46,147,214,0.07), 0 0.5px 1.5px 0 rgba(242,89,28,0.07)",
            maxWidth: "100vw",
            overflowX: "hidden",
          }}
        >
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
