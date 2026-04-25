import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";
import { OfflineBanner } from "@/components/feedback/offline-banner";
import { ToastProvider } from "@/components/feedback/toast-provider";
import { Locator } from "nextjs-locator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SideQuest",
  description: "Gamified quest-style todo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <ToastProvider>
            <OfflineBanner />
            {children}
          </ToastProvider>
        </AuthSessionProvider>
        <Analytics />
        {process.env.NODE_ENV === "development" ? <Locator editor="cursor" /> : null}
      </body>
    </html>
  );
}
