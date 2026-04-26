import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow — Kanban for small teams",
  description: "A Trello-inspired Kanban board.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <QueryProvider>
            {children}
            <Toaster
              richColors
              position="top-right"
              className="md:!top-4"
              toastOptions={{
                classNames: {
                  toast: "!font-sans",
                },
              }}
            />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}