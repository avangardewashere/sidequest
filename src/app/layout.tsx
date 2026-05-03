import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";
import { OfflineBanner } from "@/components/feedback/offline-banner";
import { ToastProvider } from "@/components/feedback/toast-provider";
import { InstallAppBanner } from "@/components/pwa/install-app-banner";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-register";
import { Locator } from "nextjs-locator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter — Phase 7.1 design-token font. Used by the new design system.
// Geist stays for backwards compatibility with Cycle 0-6 pages until Cycle 9.2 sweeps them.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SideQuest",
  description: "Gamified quest-style todo app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "SideQuest",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121211" },
  ],
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
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <ToastProvider>
            <OfflineBanner />
            <ServiceWorkerRegistrar />
            <InstallAppBanner />
            {children}
          </ToastProvider>
        </AuthSessionProvider>
        <Analytics />
        {process.env.NODE_ENV === "development" ? <Locator editor="cursor" /> : null}
      </body>
    </html>
  );
}
