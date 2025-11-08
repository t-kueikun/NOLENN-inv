"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/30 bg-white/20 text-foreground shadow-[0_12px_30px_rgba(2,6,23,0.18)] backdrop-blur hover:bg-white/30 dark:border-white/15 dark:bg-white/10 dark:text-white"
        >
          {renderIcon()}
          <span className="sr-only">テーマを切り替える</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[140px] border border-white/20 bg-white/80 text-foreground backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
      >
        <DropdownMenuItem onSelect={() => setTheme("light")}>ライト</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>ダーク</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>システム</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
