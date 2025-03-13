"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ListTodo, 
  History, 
  Settings, 
  Bot 
} from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const items = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: ListTodo
    },
    {
      title: "History",
      href: "/history",
      icon: History
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings
    },
  ]

  return (
    <nav
      className={cn(
        "flex flex-col w-64 border-r bg-background p-4 space-y-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 px-2 py-4">
        <Bot className="h-6 w-6" />
        <span className="text-xl font-bold">Skybit</span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "transparent"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
