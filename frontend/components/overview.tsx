"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Mon",
    total: 4,
  },
  {
    name: "Tue",
    total: 6,
  },
  {
    name: "Wed",
    total: 8,
  },
  {
    name: "Thu",
    total: 5,
  },
  {
    name: "Fri",
    total: 7,
  },
  {
    name: "Sat",
    total: 3,
  },
  {
    name: "Sun",
    total: 2,
  },
]

export function Overview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
        <CardDescription>
          Task execution statistics for the past week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Scheduled</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
              <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Running</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Failed</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
