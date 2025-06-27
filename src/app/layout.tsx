// src/app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "J.A.R.V.I.S. System",
  description: "Iron Man's assistant powered by Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
