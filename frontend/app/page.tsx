import { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Overview } from "@/components/overview"
import { RecentTasks } from "@/components/recent-tasks"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Skybit dashboard for managing agent tasks",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Monitor and manage your agent tasks">
        <Link href="/tasks/new">
          <Button>Create task</Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2">
          <Overview />
        </div>
        <div className="col-span-2">
          <RecentTasks />
        </div>
      </div>
    </DashboardShell>
  )
}
