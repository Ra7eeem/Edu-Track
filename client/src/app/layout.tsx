import type { Metadata } from "next"
import { IBM_Plex_Sans_Arabic, Geist_Mono, Cairo } from "next/font/google"
import "./globals.css"
import { cn }             from "@/shared/lib/tailwind-cn"
import { QueryProvider }  from "@/shared/providers/query-provider"
import { ThemeProvider }  from "@/shared/providers/theme-provider"
import { PwaRegister }    from "@/shared/components/pwa-register"
import { SplashScreen }   from "@/shared/components/splash-screen"

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets:  ["arabic"],
  weight:   ["300", "400", "500", "600", "700"],
  variable: "--font-ibm",
  display:  "swap",
})

// Cairo — primary UI + display font for Mi'raj
const cairo = Cairo({
  subsets:  ["arabic", "latin"],
  weight:   ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display:  "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
})

export const metadata: Metadata = {
  title: {
    default:  "معراج | Mi'Raj Educational Platform",
    template: "%s | معراج",
  },
  description: "منصة معراج التعليمية — نظّم مجموعاتك وتابع حضور طلابك",
  themeColor:  [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#1B2A4A" },
  ],
  appleWebApp: {
    capable:        true,
    statusBarStyle: "default",
    title:          "معراج",
  },
  icons: {
    icon:  [
      // Use main logo as favicon (SVG works in modern browsers)
      { url: "/main-logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg",  sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [{ url: "/main-logo.svg", type: "image/svg+xml" }],
  },
  viewport: {
    width:        "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit:  "cover",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn("h-full antialiased", ibmPlexArabic.variable, cairo.variable, geistMono.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="mearaj-theme"
          disableTransitionOnChange
        >
          <SplashScreen />
          <PwaRegister />

          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
