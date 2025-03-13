"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, Play } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Mock data for recent tasks
const recentTasks = [
  {
    id: "task_1",
    name: "Daily Website Monitoring",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    model: "openai"
  },
  {
    id: "task_2",
    name: "Weekly Data Extraction",
    status: "scheduled",
    timestamp: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
    model: "anthropic"
  },
  {
    id: "task_3",
    name: "Social Media Monitoring",
    status: "running",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    model: "openai"
  },
  {
    id: "task_4",
    name: "Market Research",
    status: "failed",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    model: "anthropic"
  },
  {
    id: "task_5",
    name: "Customer Feedback Analysis",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    model: "openai"
  }
]

export function RecentTasks() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "running":
        return <Play className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">Completed</Badge>
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">Scheduled</Badge>
      case "running":
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">Running</Badge>
      case "failed":
        return <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRelativeTime = (date: Date) => {
    if (date > new Date()) {
      return `in ${formatDistanceToNow(date)}`
    }
    return `${formatDistanceToNow(date)} ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>
          Latest task executions and scheduled runs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-full p-1.5 
                  ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 
                    task.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900' : 
                    task.status === 'running' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                    'bg-red-100 dark:bg-red-900'}`}>
                  {getStatusIcon(task.status)}
                </div>
                <div>
                  <p className="font-medium">{task.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{getRelativeTime(task.timestamp)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {task.model === 'openai' ? 'OpenAI' : 'Anthropic'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                {getStatusBadge(task.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
