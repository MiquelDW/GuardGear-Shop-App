import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
// wrap entire application with context provider component to use  React Query
import QCProvider from "@/components/QCProvider";
// render the 'Toaster' component and display when needed
import { Toaster } from "@/components/ui/toaster";
import { constructMetadata } from "@/lib/utils";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = constructMetadata();

// Root Layout Component wraps around all routes inside the application
// it ensures a consistent layout for all routes within the application
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={recursive.className}>
          <QCProvider>{children}</QCProvider>

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
