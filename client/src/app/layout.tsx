import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/shared/lib/tailwind-cn";
import { QueryProvider } from "@/shared/providers/query-provider";
import { PwaRegister } from "@/shared/components/pwa-register";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduTrack — منصة إدارة المجموعات التعليمية",
  description: "نظّم مجموعاتك وتابع حضور طلابك بسهولة",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  appleWebApp: {
    capable:        true,
    statusBarStyle: "default",
    title:          "EduTrack",
  },
  icons: {
    icon:  [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
  },
  viewport: {
    width:        "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit:  "cover",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={cn("h-full antialiased", ibmPlexArabic.variable, geistMono.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        <PwaRegister />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
