'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"
import Link from "next/link"
import { useAppSelector } from "@/lib/hooks"

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Welcome back{user?.name ? `, ${user.name}` : ''}</CardTitle>
            <CardDescription>Ready to improve your English grammar today?</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/dashboard/new-test">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start New Test
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Tests Completed</span>
              <span className="font-bold text-xl">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Avg. Score</span>
              <span className="font-bold text-xl">—</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
