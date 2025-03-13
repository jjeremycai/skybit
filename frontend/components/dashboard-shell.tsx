"use client"

import * as React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav className="hidden md:flex" />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="md:hidden">
              {/* Mobile nav toggle would go here */}
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className={cn("container py-6", className)} {...props}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
