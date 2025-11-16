"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const currentYear = new Date().getFullYear()

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-t border-muted/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "px-4 py-6 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <p className="font-medium text-foreground">
        Sistem Informasi ini dikembangkan oleh Unit SIMRS RSUD Otosikandar Dinata Soreang.
      </p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        &copy; {currentYear} Unit SIMRS RSUD Otosikandar Dinata Soreang. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  )
}
