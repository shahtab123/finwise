import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/Sidebar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "FincWise",
  description: "Smart Financial Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("h-full bg-background font-sans antialiased", inter.className)}>
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 transition-all duration-300 md:pl-72 pt-16 md:pt-0 relative">
            <div className="absolute inset-0 z-[-1]" />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
