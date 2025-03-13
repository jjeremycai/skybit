"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Bot, Clock, Code, Globe, Terminal } from "lucide-react"
import Link from "next/link"

export default function NewTaskPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prompt: "",
    instance_type: "ubuntu",
    model_provider: "openai",
    system_prompt: "",
    schedule_type: "interval",
    interval_minutes: 60,
    cron_expression: "0 * * * *",
    tools: [
      { name: "bash", enabled: true },
      { name: "computer", enabled: true },
      { name: "edit", enabled: false }
    ],
    enabled: true
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleToolToggle = (toolName: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.map(tool => 
        tool.name === toolName ? { ...tool, enabled } : tool
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    
    // In a real app, this would make an API call to create the task
    setTimeout(() => {
      router.push("/tasks")
    }, 1000)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Task" text="Set up a new agent task">
        <Link href="/tasks">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
      </DashboardHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Basic information about your task
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Daily Website Monitoring" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Check website status and performance metrics" 
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Configure the agent type and model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Instance Type</Label>
                <RadioGroup 
                  defaultValue={formData.instance_type}
                  onValueChange={(value) => handleSelectChange("instance_type", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="ubuntu"
                      id="ubuntu"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="ubuntu"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Terminal className="mb-3 h-6 w-6" />
                      <span className="font-semibold">Ubuntu</span>
                      <span className="text-xs text-muted-foreground">Command-line environment</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="browser"
                      id="browser"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="browser"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Globe className="mb-3 h-6 w-6" />
                      <span className="font-semibold">Browser</span>
                      <span className="text-xs text-muted-foreground">Web browsing environment</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>Model Provider</Label>
                <RadioGroup 
                  defaultValue={formData.model_provider}
                  onValueChange={(value) => handleSelectChange("model_provider", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="openai"
                      id="openai"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="openai"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Bot className="mb-3 h-6 w-6" />
                      <span className="font-semibold">OpenAI</span>
                      <span className="text-xs text-muted-foreground">OpenAI CUA</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="anthropic"
                      id="anthropic"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="anthropic"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Bot className="mb-3 h-6 w-6" />
                      <span className="font-semibold">Anthropic</span>
                      <span className="text-xs text-muted-foreground">Claude 3.7</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.instance_type === "ubuntu" && (
                <div className="space-y-4">
                  <Label>Tools</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <div className="font-medium">Bash Tool</div>
                        <div className="text-sm text-muted-foreground">
                          Execute shell commands
                        </div>
                      </div>
                      <Switch
                        checked={formData.tools.find(t => t.name === "bash")?.enabled}
                        onCheckedChange={(checked) => handleToolToggle("bash", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <div className="font-medium">Computer Tool</div>
                        <div className="text-sm text-muted-foreground">
                          Basic computer operations
                        </div>
                      </div>
                      <Switch
                        checked={formData.tools.find(t => t.name === "computer")?.enabled}
                        onCheckedChange={(checked) => handleToolToggle("computer", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div className="space-y-0.5">
                        <div className="font-medium">Edit Tool</div>
                        <div className="text-sm text-muted-foreground">
                          Edit files and documents
                        </div>
                      </div>
                      <Switch
                        checked={formData.tools.find(t => t.name === "edit")?.enabled}
                        onCheckedChange={(checked) => handleToolToggle("edit", checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Instructions</CardTitle>
              <CardDescription>
                What should the agent do?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="prompt">Task Prompt</Label>
                <Textarea 
                  id="prompt" 
                  name="prompt" 
                  placeholder="Visit example.com and check if the website is up. Look for any error messages or performance issues." 
                  className="min-h-[150px]"
                  value={formData.prompt}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="system_prompt">Custom System Prompt (Optional)</Label>
                <Textarea 
                  id="system_prompt" 
                  name="system_prompt" 
                  placeholder="Leave blank to use the default system prompt for the selected instance type" 
                  className="min-h-[100px]"
                  value={formData.system_prompt}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                When should this task run?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue={formData.schedule_type}
                onValueChange={(value) => handleSelectChange("schedule_type", value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="interval">Interval</TabsTrigger>
                  <TabsTrigger value="cron">Cron</TabsTrigger>
                </TabsList>
                <TabsContent value="interval" className="mt-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="interval_minutes">Run every</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="interval_minutes" 
                        name="interval_minutes" 
                        type="number" 
                        min="1"
                        value={formData.interval_minutes}
                        onChange={(e) => handleNumberChange("interval_minutes", e.target.value)}
                        className="w-24"
                      />
                      <Select 
                        defaultValue="minutes"
                        onValueChange={(value) => {
                          if (value === "hours") {
                            handleNumberChange("interval_minutes", (formData.interval_minutes * 60).toString())
                          } else if (value === "minutes" && formData.interval_minutes % 60 === 0) {
                            handleNumberChange("interval_minutes", (formData.interval_minutes / 60).toString())
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="cron" className="mt-4 space-y-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cron_expression">Cron Expression</Label>
                      <Link 
                        href="https://crontab.guru/" 
                        target="_blank"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Need help?
                      </Link>
                    </div>
                    <Input 
                      id="cron_expression" 
                      name="cron_expression" 
                      placeholder="0 * * * *" 
                      value={formData.cron_expression}
                      onChange={handleChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Format: minute hour day month weekday
                    </p>
                    <div className="text-sm">
                      <p className="font-medium">Examples:</p>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li><code className="bg-muted px-1 rounded">0 * * * *</code> - Every hour</li>
                        <li><code className="bg-muted px-1 rounded">0 9 * * 1-5</code> - Weekdays at 9 AM</li>
                        <li><code className="bg-muted px-1 rounded">0 0 * * 0</code> - Sundays at midnight</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Enable Task</div>
                  <div className="text-sm text-muted-foreground">
                    Task will be scheduled immediately if enabled
                  </div>
                </div>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => handleSwitchChange("enabled", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Link href="/tasks">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Create Task</Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </DashboardShell>
  )
}
