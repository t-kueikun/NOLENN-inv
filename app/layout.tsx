import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "./providers"
import { AppHeader } from "@/components/app-header"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NOLENN",
  description: "Created with NOLENN",
  generator: "NOLENN",
  icons: {
    icon: "/Nollen-logo-2.webp",
    shortcut: "/Nollen-logo-2.webp",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={cn(_geist.className, "min-h-screen bg-background text-foreground antialiased")}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <AppHeader />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-border bg-muted/30 text-sm text-muted-foreground">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                  <p className="text-xs sm:text-sm">© {new Date().getFullYear()} NOLENN</p>
                  <div className="flex items-center gap-4">
                    <Link href="/terms" className="hover:text-foreground">
                      利用規約
                    </Link>
                    <Link href="/privacy" className="hover:text-foreground">
                      プライバシーポリシー
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
