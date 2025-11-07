"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/app/providers"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navLinks = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/pricing", label: "プラン" },
]

export function AppHeader() {
  const pathname = usePathname()
  const { user, plan } = useAuth()
  const [open, setOpen] = useState(false)

  const renderNavLinks = (onNavigate?: () => void) =>
    navLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname?.startsWith(link.href) ? "text-primary" : "text-muted-foreground",
        )}
      >
        {link.label}
      </Link>
    ))

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
            AIDE
          </Link>
          <nav className="hidden items-center gap-6 md:flex">{renderNavLinks()}</nav>
        </div>

        <div className="flex items-center gap-3">
          {plan === "pro" ? (
            <Badge variant="outline" className="hidden md:inline-flex">
              Pro
            </Badge>
          ) : (
            <Button size="sm" className="hidden md:inline-flex" asChild>
              <Link href="/checkout">アップグレード</Link>
            </Button>
          )}

          {!user ? (
            <Button size="sm" variant="outline" asChild className="hidden md:inline-flex">
              <Link href="/sign-in">ログイン</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild className="hidden md:inline-flex">
              <Link href="/account">マイアカウント</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">メニュー</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 pt-6">{renderNavLinks(() => setOpen(false))}</div>
              {plan === "pro" ? (
                <Badge variant="outline" className="w-fit">
                  Pro
                </Badge>
              ) : (
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/checkout">アップグレード</Link>
                </Button>
              )}
              {!user ? (
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link href="/sign-in">ログイン</Link>
                </Button>
              ) : (
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link href="/account">マイアカウント</Link>
                </Button>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
