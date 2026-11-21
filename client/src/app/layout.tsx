import type { Metadata, Viewport } from "next"
import { IBM_Plex_Sans_Arabic, Amiri, Geist_Mono } from "next/font/google"
import "./globals.css"
import { cn }             from "@/shared/lib/tailwind-cn"
import { NextAuthProvider } from "@/shared/providers/next-auth-provider"
import { QueryProvider }  from "@/shared/providers/query-provider"
import { ThemeProvider }  from "@/shared/providers/theme-provider"
import { PwaRegister }    from "@/shared/components/pwa-register"
import { SplashScreen }   from "@/shared/components/splash-screen"

// Body & UI font — IBM Plex Sans Arabic
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets:  ["arabic"],
  weight:   ["400", "500", "600", "700"],
  variable: "--font-ibm",
  display:  "swap",
})

// Headings, Quranic verses & Numbers — Amiri
const amiri = Amiri({
  subsets:  ["arabic"],
  weight:   ["400", "700"],
  variable: "--font-amiri",
  display:  "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
})

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4ECD8" },
    { media: "(prefers-color-scheme: dark)",  color: "#0E1B19" },
  ],
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit:  "cover",
}

export const metadata: Metadata = {
  title: {
    default:  "معراج | ارتقِ بتجربة تدريسك",
    template: "%s | معراج",
  },
  description: "منصة معراج التعليمية — إدارة المجموعات والحضور والتفاعل بين المدرس وطلابه في مكانٍ واحد برُوحٍ عربية أصيلة.",
  appleWebApp: {
    capable:        true,
    statusBarStyle: "default",
    title:          "معراج",
  },
  icons: {
    icon:  [
      { url: "/main-logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg",  sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [{ url: "/main-logo.svg", type: "image/svg+xml" }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn("h-full antialiased", ibmPlexArabic.variable, amiri.variable, geistMono.variable)}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          storageKey="mearaj-theme"
          disableTransitionOnChange
        >
          <SplashScreen />
          <PwaRegister />

          <NextAuthProvider>
            <QueryProvider>{children}</QueryProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
