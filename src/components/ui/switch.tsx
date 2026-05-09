"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SwitchProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full border transition-colors",
        checked ? "bg-primary border-primary" : "bg-muted border-border",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow transform transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

