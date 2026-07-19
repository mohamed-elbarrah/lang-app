'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PlayCircle, Trophy, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAppSelector } from "@/lib/hooks"
import { useGetUserStatsQuery } from "@/lib/features/dashboard-api-slice"

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth)
  const { data: stats, isLoading, error } = useGetUserStatsQuery()

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
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : error ? (
              <p className="text-sm text-muted-foreground">Could not load stats</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Tests Completed</span>
                  <span className="font-bold text-xl">{stats?.totalExams ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Avg. Score</span>
                  <span className="font-bold text-xl">{stats?.averageScore != null ? `${stats.averageScore}%` : '—'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {stats?.recentExams && stats.recentExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentExams.map((exam: any) => (
                <Link
                  key={exam.id}
                  href={`/dashboard/results/${exam.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {exam.score != null && exam.score >= 80 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : exam.score != null && exam.score >= 60 ? (
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{exam.questionCount} Questions</p>
                      <p className="text-xs text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {exam.score != null ? `${exam.score}%` : 'Pending'}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && stats?.totalExams === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="mb-4">No tests completed yet.</p>
            <Button asChild>
              <Link href="/dashboard/new-test">Take Your First Test</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
