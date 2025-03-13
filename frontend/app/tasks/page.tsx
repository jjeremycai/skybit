"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Play, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Pause
} from "lucide-react"

// Mock data for tasks
const tasks = [
  {
    id: "task_1",
    name: "Daily Website Monitoring",
    description: "Check website status and performance metrics",
    schedule_type: "interval",
    interval_minutes: 60,
    model_provider: "openai",
    instance_type: "browser",
    enabled: true,
    last_run: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    last_status: "success"
  },
  {
    id: "task_2",
    name: "Weekly Data Extraction",
    description: "Extract data from multiple sources and compile reports",
    schedule_type: "cron",
    cron_expression: "0 9 * * 1",
    model_provider: "anthropic",
    instance_type: "ubuntu",
    enabled: true,
    last_run: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    last_status: "success"
  },
  {
    id: "task_3",
    name: "Social Media Monitoring",
    description: "Track mentions and engagement across platforms",
    schedule_type: "interval",
    interval_minutes: 30,
    model_provider: "openai",
    instance_type: "browser",
    enabled: true,
    last_run: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    last_status: "running"
  },
  {
    id: "task_4",
    name: "Market Research",
    description: "Analyze market trends and competitor activities",
    schedule_type: "cron",
    cron_expression: "0 9 * * 1-5",
    model_provider: "anthropic",
    instance_type: "ubuntu",
    enabled: false,
    last_run: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    next_run: null,
    last_status: "failed"
  },
  {
    id: "task_5",
    name: "Customer Feedback Analysis",
    description: "Process and categorize customer feedback",
    schedule_type: "interval",
    interval_minutes: 120,
    model_provider: "openai",
    instance_type: "ubuntu",
    enabled: true,
    last_run: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    last_status: "success"
  }
]

export default function TasksPage() {
  const [tasksData, setTasksData] = useState(tasks)

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not scheduled"
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">Success</Badge>
      case "running":
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">Running</Badge>
      case "failed":
        return <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getScheduleDescription = (task: any) => {
    if (task.schedule_type === "interval") {
      if (task.interval_minutes < 60) {
        return `Every ${task.interval_minutes} minutes`
      } else if (task.interval_minutes === 60) {
        return "Hourly"
      } else {
        const hours = task.interval_minutes / 60
        return `Every ${hours} ${hours === 1 ? 'hour' : 'hours'}`
      }
    } else if (task.schedule_type === "cron") {
      // This is a simplified interpretation of cron expressions
      if (task.cron_expression === "0 * * * *") {
        return "Hourly"
      } else if (task.cron_expression === "0 9 * * 1-5") {
        return "Weekdays at 9 AM"
      } else if (task.cron_expression === "0 9 * * 1") {
        return "Mondays at 9 AM"
      } else {
        return task.cron_expression
      }
    }
    return "Unknown schedule"
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasksData(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, enabled: !task.enabled }
        // If enabling, set a next run time
        if (updatedTask.enabled) {
          const minutes = updatedTask.schedule_type === "interval" ? updatedTask.interval_minutes : 60
          updatedTask.next_run = new Date(Date.now() + 1000 * 60 * minutes).toISOString()
        } else {
          updatedTask.next_run = null
        }
        return updatedTask
      }
      return task
    }))
  }

  const runTaskNow = (taskId: string) => {
    setTasksData(tasks.map(task => {
      if (task.id === taskId) {
        return { 
          ...task, 
          last_status: "running",
          last_run: new Date().toISOString()
        }
      }
      return task
    }))
    // In a real app, this would trigger an API call to run the task
    setTimeout(() => {
      setTasksData(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          return { 
            ...task, 
            last_status: "success"
          }
        }
        return task
      }))
    }, 3000)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Tasks" text="Manage your agent tasks">
        <Link href="/tasks/new">
          <Button>Create task</Button>
        </Link>
      </DashboardHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            View and manage all your agent tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksData.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{task.name}</span>
                      <span className="text-xs text-muted-foreground">{task.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{getScheduleDescription(task)}</span>
                      <span className="text-xs text-muted-foreground">{task.instance_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {task.model_provider === 'openai' ? 'OpenAI' : 'Anthropic'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {task.last_status === 'success' && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                      {task.last_status === 'running' && <Play className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                      {task.last_status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                      <span>{formatDateTime(task.last_run)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {task.enabled ? (
                        <>
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span>{formatDateTime(task.next_run)}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Disabled</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(task.last_status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => runTaskNow(task.id)}
                        disabled={task.last_status === 'running'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        {task.enabled ? <Pause className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <Link href={`/tasks/${task.id}`}>
                            <DropdownMenuItem>
                              View details
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/tasks/${task.id}/edit`}>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
