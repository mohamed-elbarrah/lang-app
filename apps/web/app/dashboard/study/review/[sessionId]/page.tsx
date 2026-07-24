'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useGetStudySessionReviewQuery } from '@/lib/features/study-api-slice'
import type { StudyAnswerWithCorrect } from '@/lib/features/study-api-slice'
import { normalizeOptions } from '@/lib/exam-utils'
import type { OptionItem } from '@/lib/exam-utils'

export default function StudyReviewPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { data: session, isLoading, error } = useGetStudySessionReviewQuery(sessionId)

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/study"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Study Review</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            Could not load the study session.
          </CardContent>
        </Card>
      </div>
    )
  }

  const answers = session.answers || []
  const correctCount = answers.filter((a) => a.isCorrect === true).length
  const incorrectCount = answers.filter((a) => a.isCorrect === false).length
  const unansweredCount = answers.filter((a) => a.isCorrect === null).length

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/study"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Study Review</h1>
          <p className="text-muted-foreground mt-1">
            {session.lesson.title} &middot; {session.completedAt
              ? `Completed on ${new Date(session.completedAt).toLocaleDateString()}`
              : 'In progress'}
          </p>
        </div>
      </div>

      {session.score != null && (
        <Card className={session.score >= 80 ? 'bg-green-50 border-green-200' : session.score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="pt-6 flex items-center justify-around text-center">
            <div>
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-4xl font-bold">{session.score}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Correct</div>
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
              <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
            </div>
            {unansweredCount > 0 && (
              <div>
                <div className="text-sm text-muted-foreground">Unanswered</div>
                <div className="text-2xl font-bold text-muted-foreground">{unansweredCount}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {answers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Answers</h2>

          {answers.map((answer: StudyAnswerWithCorrect) => {
            const content = answer.content || {}
            const instruction = String(content.instruction || '')
            const questionText = String(content.question || content.sentence || content.scenario || '')
            const options = normalizeOptions(content.options)
            const isCorrect = answer.isCorrect === true
            const isWrong = answer.isCorrect === false

            const userAnswerStr = answer.userAnswer ?? null

            const typeLabel: Record<string, string> = {
              multiple_choice: 'Multiple Choice',
              fill_blank: 'Fill in the Blank',
              error_correction: 'Correct the Error',
              sentence_creation: 'Create a Sentence',
              scenario: 'Scenario',
            }

            return (
              <Card
                key={answer.id}
                className={
                  isCorrect
                    ? 'border-green-200 bg-green-50/30'
                    : isWrong
                      ? 'border-red-200 bg-red-50/30'
                      : ''
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <span>Exercise {answer.order}</span>
                      <Badge variant="secondary" className="text-xs">
                        {typeLabel[answer.type] || answer.type}
                      </Badge>
                    </CardTitle>
                    {isCorrect && <CheckCircle2 className="text-green-600 h-6 w-6 shrink-0" />}
                    {isWrong && <XCircle className="text-red-600 h-6 w-6 shrink-0" />}
                  </div>
                  {instruction && (
                    <CardDescription className="text-sm font-medium text-muted-foreground mt-2">
                      {instruction}
                    </CardDescription>
                  )}
                  <CardDescription className="text-base text-foreground mt-1">
                    {questionText}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {options && options.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {options.map((opt) => {
                        const isSelected = userAnswerStr === opt.label
                        return (
                          <div
                            key={opt.label}
                            className={`flex items-center gap-3 px-3 py-2 rounded border text-sm ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-green-100 border-green-300 text-green-800'
                                  : 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-muted/30 border-border'
                            }`}
                          >
                            <span className="font-bold">{opt.label}</span>
                            <span>{opt.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {userAnswerStr && (
                    <div className="p-3 bg-background rounded border text-sm">
                      <div className="flex items-center justify-between">
                        <span>
                          Your answer:{' '}
                          <strong className={isWrong ? 'text-red-600 line-through' : ''}>
                            {userAnswerStr}
                          </strong>
                        </span>
                        {isCorrect && (
                          <Badge variant="outline" className="text-green-600 border-green-200">Correct</Badge>
                        )}
                        {isWrong && (
                          <Badge variant="outline" className="text-red-600 border-red-200">Incorrect</Badge>
                        )}
                      </div>
                      {isWrong && answer.correctAnswer && (
                        <div className="mt-2 pt-2 border-t text-green-700">
                          Correct answer: <strong>{answer.correctAnswer}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {!userAnswerStr && (
                    <div className="p-3 bg-muted/30 rounded border text-sm">
                      <span className="text-muted-foreground">Not answered</span>
                      {answer.correctAnswer && (
                        <div className="mt-2 pt-2 border-t text-green-700">
                          Correct answer: <strong>{answer.correctAnswer}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {answer.explanation && (
                    <div className="bg-background p-4 rounded border text-sm">
                      <p className="font-semibold mb-1">Explanation:</p>
                      <p className="text-muted-foreground">{answer.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/study">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Lessons
          </Link>
        </Button>
      </div>
    </div>
  )
}
