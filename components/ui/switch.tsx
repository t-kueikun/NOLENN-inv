'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-white/50 bg-white/30 p-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65),0_12px_30px_rgba(15,23,42,0.25)] backdrop-blur-lg transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/5',
        'data-[state=checked]:border-primary/40 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary/80 data-[state=checked]:to-primary/60 dark:data-[state=checked]:from-primary/50 dark:data-[state=checked]:to-primary/40',
        'data-[state=unchecked]:bg-white/20 dark:data-[state=unchecked]:bg-white/10',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none relative flex size-5 items-center justify-center rounded-full bg-white/90 shadow-[0_8px_20px_rgba(15,23,42,0.25)] transition-transform duration-200 ease-out',
          'data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0',
          'dark:bg-white/80',
        )}
      >
        <span className="block h-3.5 w-3.5 rounded-full bg-gradient-to-br from-white to-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:from-white/80 dark:to-white/50" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
