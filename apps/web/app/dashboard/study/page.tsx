'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useGetStudySessionsQuery } from '@/lib/features/study-api-slice'

interface LessonPart {
  id: string
  name: string
  order: number
  lessons: { id: string; title: string }[]
}

export default function StudyPage() {
  const router = useRouter()
  const { data: completedSessions } = useGetStudySessionsQuery()
  const [parts, setParts] = useState<LessonPart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((json) => {
        const data = json.data || json
        if (Array.isArray(data)) {
          setParts(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const completedLessonIds = new Set(
    (completedSessions || [])
      .filter((s) => s.status === 'completed')
      .map((s) => s.lessonId),
  )

  const inProgressLessonIds = new Set(
    (completedSessions || [])
      .filter((s) => s.status === 'in_progress')
      .map((s) => s.lessonId),
  )

  if (loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Lessons</h1>
        <p className="text-muted-foreground mt-1">
          Pick a lesson, learn the rules, then practice with 10 exercises.
        </p>
      </div>

      {parts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No lessons available yet.
          </CardContent>
        </Card>
      ) : (
        parts
          .sort((a, b) => a.order - b.order)
          .map((part) => (
            <div key={part.id} className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">{part.name}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {part.lessons
                  .sort((a, b) => 0)
                  .map((lesson) => {
                    const completed = completedLessonIds.has(lesson.id)
                    const inProgress = inProgressLessonIds.has(lesson.id)
                    return (
                      <Button
                        key={lesson.id}
                        variant="outline"
                        className="h-auto p-4 justify-start text-left"
                        asChild
                      >
                        <Link href={`/dashboard/study/${lesson.id}`}>
                          <div className="flex items-start gap-3 w-full">
                            <div className="mt-0.5">
                              {completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                              ) : inProgress ? (
                                <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{lesson.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {completed && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    Completed
                                  </Badge>
                                )}
                                {inProgress && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    In Progress
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                          </div>
                        </Link>
                      </Button>
                    )
                  })}
              </div>
            </div>
          ))
      )}

      {completedSessions && completedSessions.length > 0 && (
        <div className="pt-4 border-t">
          <h2 className="text-xl font-bold tracking-tight mb-4">Review Past Sessions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {completedSessions.slice(0, 6).map((session) => (
              <Button
                key={session.id}
                variant="ghost"
                className="h-auto p-3 justify-start text-left"
                asChild
              >
                <Link href={`/dashboard/study/review/${session.id}`}>
                  <div className="flex items-center gap-3 w-full">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{session.lesson.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {session.score != null ? `${session.score}%` : 'Not scored'} &middot; {session.exerciseCount} exercises
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
          {completedSessions.length > 6 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Showing 6 of {completedSessions.length} completed sessions.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
