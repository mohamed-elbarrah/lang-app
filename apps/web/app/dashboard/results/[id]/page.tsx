'use client'

import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, ArrowLeft, AlertCircle, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useGetResultDetailQuery } from '@/lib/features/results-api-slice'

export default function ResultDetailsPage() {
  const params = useParams()
  const examId = params.id as string
  const { data: rawData, isLoading, error } = useGetResultDetailQuery(examId)

  const result = rawData && typeof rawData === 'object' && 'data' in rawData
    ? (rawData as any).data
    : rawData

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/results"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Exam Result</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            Could not load the exam result.
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = result.summary || {}
  const score = result.score
  const scoreColor = score != null
    ? score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
    : 'text-muted-foreground'
  const scoreBg = score != null
    ? score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    : 'bg-muted/30'
  const scoreLabel = score != null
    ? score >= 80 ? 'Great Job' : score >= 60 ? 'Good Effort' : 'Keep Practicing'
    : 'Not Scored'

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/results"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Result</h1>
          <p className="text-muted-foreground mt-1">
            {result.completedAt
              ? `Completed on ${new Date(result.completedAt).toLocaleDateString()}`
              : 'Not yet completed'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`md:col-span-1 ${scoreBg}`}>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="text-sm font-medium text-muted-foreground mb-2">Final Score</div>
            <div className={`text-5xl font-bold ${scoreColor} mb-2`}>
              {score != null ? `${score}%` : '—'}
            </div>
            <Badge className="mt-2">{scoreLabel}</Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Total Questions</span>
              <p className="font-medium text-lg">{summary.totalQuestions || result.questionCount}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Correct Answers</span>
              <p className="font-medium text-lg text-green-600">{summary.correctCount ?? 0}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Incorrect Answers</span>
              <p className="font-medium text-lg text-red-600">{summary.incorrectCount ?? 0}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Mode</span>
              <p className="font-medium text-lg capitalize">{result.correctionMode}</p>
            </div>
            {summary.topicsToReview && summary.topicsToReview.length > 0 && (
              <div className="col-span-2 space-y-1">
                <span className="text-sm text-muted-foreground">Topics to Review</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {summary.topicsToReview.map((topic: string) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result.questions && result.questions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mt-8">Review Answers</h2>

          {result.questions.map((question: any) => {
            const isCorrect = question.isCorrect === true
            const isWrong = question.isCorrect === false
            const isUnanswered = question.isCorrect === null

            const content = question.content || {}
            const questionText = content.question || content.sentence || content.scenario || content.instruction || ''
            const options = content.options as string[] | undefined

            const userAnswerStr = question.userAnswer != null
              ? typeof question.userAnswer === 'string'
                ? question.userAnswer
                : JSON.stringify(question.userAnswer)
              : null

            if (isUnanswered && !isCorrect && !isWrong) {
              return null
            }

            return (
              <Card
                key={question.id}
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
                    <CardTitle className="text-lg">Question {question.order}</CardTitle>
                    {isCorrect && <CheckCircle2 className="text-green-600 h-6 w-6 shrink-0" />}
                    {isWrong && <XCircle className="text-red-600 h-6 w-6 shrink-0" />}
                    {isUnanswered && <HelpCircle className="text-muted-foreground h-6 w-6 shrink-0" />}
                  </div>
                  <CardDescription className="text-base text-foreground mt-2">
                    {questionText || `Type: ${question.type}`}
                  </CardDescription>
                  {question.lessonTopic && (
                    <Badge variant="outline" className="mt-1 text-xs w-fit">
                      {question.lessonTopic}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {options && options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {options.map((opt: string) => {
                          const letter = opt.charAt(0)
                          const isSelected = userAnswerStr === letter
                          return (
                            <span
                              key={letter}
                              className={`text-xs px-2 py-1 rounded border ${
                                isSelected
                                  ? isCorrect
                                    ? 'bg-green-100 border-green-300 text-green-800'
                                    : 'bg-red-100 border-red-300 text-red-800'
                                  : 'bg-muted/30 border-border'
                              }`}
                            >
                              {opt}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {userAnswerStr && (
                      <div className="p-3 bg-background rounded border text-sm flex items-center justify-between">
                        <span>
                          Your answer:{' '}
                          <strong className={isWrong ? 'text-red-600 line-through' : ''}>
                            {userAnswerStr}
                          </strong>
                        </span>
                        {isCorrect && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Correct
                          </Badge>
                        )}
                        {isWrong && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Incorrect
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {question.explanation && (
                    <div className="bg-background p-4 rounded border text-sm">
                      <p className="font-semibold mb-1">AI Explanation:</p>
                      <p className="text-muted-foreground">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
