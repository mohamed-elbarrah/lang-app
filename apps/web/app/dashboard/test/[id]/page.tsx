'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2, AlertCircle, Clock } from "lucide-react"
import { useGetExamQuery, useSubmitAnswerMutation, useCompleteExamMutation } from '@/lib/features/exams-api-slice'
import type { Question } from '@/lib/features/exams-api-slice'
import { normalizeOptions } from '@/lib/exam-utils'
import type { OptionItem } from '@/lib/exam-utils'

function extractContent(content: Record<string, unknown>): {
  instruction: string
  questionText: string
  options?: OptionItem[]
  scenario?: string
} {
  const c = content as Record<string, unknown>
  const instruction = String(c.instruction || '')
  const questionText = String(c.question || c.sentence || c.scenario || '')
  const options = normalizeOptions(c.options)
  const scenario = c.scenario as string | undefined
  return { instruction, questionText, options, scenario }
}

function MultipleChoiceQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const { instruction, questionText, options } = extractContent(content)
  return (
    <div className="space-y-6">
      {instruction && <p className="text-sm font-medium text-muted-foreground">{instruction}</p>}
      <p className="text-lg leading-relaxed">{questionText}</p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="space-y-3">
        {options?.map((opt) => (
          <div key={opt.label} className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer has-[button[data-state=checked]]:border-primary">
            <RadioGroupItem value={opt.label} id={`opt-${opt.label}`} />
            <Label htmlFor={`opt-${opt.label}`} className="flex-1 cursor-pointer font-medium text-base">{opt.text}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

function FillBlankQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const instruction = String((content as Record<string, unknown>).instruction || '')
  const sentence = String((content as Record<string, unknown>).sentence || '')
  const parts = sentence.split('____')
  return (
    <div className="space-y-6">
      {instruction && <p className="text-sm font-medium text-muted-foreground">{instruction}</p>}
      <p className="text-lg leading-relaxed">
        {parts[0]}
        <span className="inline-block border-b-2 border-dashed border-primary px-4 mx-1 min-w-[120px]">
          {disabled ? value || '_____' : (
            <input
              className="w-full bg-transparent border-none outline-none text-center font-medium text-primary"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="type answer"
              autoFocus
            />
          )}
        </span>
        {parts[1]}
      </p>
    </div>
  )
}

function ErrorCorrectionQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const c = content as Record<string, unknown>
  const instruction = String(c.instruction || '')
  const sentence = String(c.sentence || '')
  return (
    <div className="space-y-6">
      {instruction && <p className="text-sm font-medium text-muted-foreground">{instruction}</p>}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <p className="text-lg italic">{sentence}</p>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type the corrected sentence..."
        rows={3}
        className="text-base"
      />
    </div>
  )
}

function SentenceCreationQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const c = content as Record<string, unknown>
  const instruction = String(c.instruction || '')
  return (
    <div className="space-y-6">
      {instruction && <p className="text-sm font-medium text-muted-foreground">{instruction}</p>}
      {!!c.criteria && (
        <p className="text-sm text-muted-foreground">Criteria: {String(c.criteria)}</p>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Write your sentence here..."
        rows={3}
        className="text-base"
      />
    </div>
  )
}

function ScenarioQuestion({
  content,
  value,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const { instruction, questionText, options, scenario } = extractContent(content)
  return (
    <div className="space-y-6">
      {instruction && <p className="text-sm font-medium text-muted-foreground">{instruction}</p>}
      {scenario && (
        <div className="p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">Scenario:</p>
          <p className="text-base italic">{scenario}</p>
        </div>
      )}
      <p className="text-lg leading-relaxed">{questionText}</p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="space-y-3">
        {options?.map((opt) => (
          <div key={opt.label} className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer has-[button[data-state=checked]]:border-primary">
            <RadioGroupItem value={opt.label} id={`sc-${opt.label}`} />
            <Label htmlFor={`sc-${opt.label}`} className="flex-1 cursor-pointer font-medium text-base">{opt.text}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const { data: exam, isLoading: examLoading, error: examError, refetch } = useGetExamQuery(examId)
  const [submitAnswer, { isLoading: submitting }] = useSubmitAnswerMutation()
  const [completeExam, { isLoading: completing }] = useCompleteExamMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean
    explanation: string | null
  } | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [savedNotif, setSavedNotif] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const submittingRef = useRef(false)

  const questions: Question[] = exam?.questions || []
  const currentQuestion = questions[currentIndex]
  const isInstantMode = exam?.correctionMode === 'instant'
  const isGenerating = exam?.status === 'generating'
  const answeredCount = questions.filter((q) => q.userAnswer != null).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  useEffect(() => {
    if (currentQuestion?.userAnswer != null) {
      const existingAnswer = typeof currentQuestion.userAnswer === 'string'
        ? currentQuestion.userAnswer
        : JSON.stringify(currentQuestion.userAnswer)
      setAnswer(existingAnswer)
      setSubmitted(true)
      setLastResult({
        isCorrect: currentQuestion.isCorrect ?? false,
        explanation: currentQuestion.explanation,
      })
    } else {
      setAnswer('')
      setSubmitted(false)
      setLastResult(null)
    }
    setPageError(null)
    setSavedNotif(false)
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current)
        advanceTimerRef.current = null
      }
    }
  }, [currentIndex, currentQuestion?.id])

  useEffect(() => {
    if (isGenerating) {
      pollingRef.current = setInterval(() => {
        refetch()
      }, 3000)
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [isGenerating, refetch])

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'data' in err) {
      const errorData = (err as { data: { error?: { message?: string } } }).data
      const message = errorData?.error?.message
      if (message) return Array.isArray(message) ? message[0] : message
    }
    return 'An unexpected error occurred'
  }

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, questions.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }, [currentIndex])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || !currentQuestion || !answer.trim()) return
    submittingRef.current = true
    setPageError(null)
    try {
      const result = await submitAnswer({
        examId,
        questionId: currentQuestion.id,
        answer,
      }).unwrap()

      setSubmitted(true)

      if (result.completed) {
        setCompleted(true)
        return
      }

      if (isInstantMode) {
        setLastResult({
          isCorrect: result.isCorrect,
          explanation: result.explanation,
        })
      } else {
        setSavedNotif(true)
        advanceTimerRef.current = setTimeout(() => {
          setSavedNotif(false)
          handleNext()
        }, 1000)
      }
    } catch (err) {
      const message = getErrorMessage(err)
      if (message === 'Question already answered') {
        setSubmitted(true)
        if (isInstantMode) {
          refetch()
        } else {
          setSavedNotif(true)
          advanceTimerRef.current = setTimeout(() => {
            setSavedNotif(false)
            handleNext()
          }, 1000)
        }
      } else {
        setPageError(message)
      }
    } finally {
      submittingRef.current = false
    }
  }, [currentQuestion, answer, examId, submitAnswer, isInstantMode, handleNext, refetch])

  const handleComplete = useCallback(async () => {
    setPageError(null)
    try {
      await completeExam(examId).unwrap()
      router.push(`/dashboard/results/${examId}`)
    } catch (err) {
      setPageError(getErrorMessage(err))
    }
  }, [examId, completeExam, router])

  if (examLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (examError || !exam) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load exam.
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (completed || exam.status === 'completed') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold">Exam Complete!</h1>
        <p className="text-muted-foreground">Redirecting to your results...</p>
        <Button onClick={() => router.push(`/dashboard/results/${examId}`)}>
          View Results
        </Button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <Clock className="h-16 w-16 text-primary mx-auto animate-pulse" />
        <h1 className="text-3xl font-bold">Generating Your Exam</h1>
        <p className="text-muted-foreground">
          Please wait while we prepare your questions using AI...
        </p>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Cancel
        </Button>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">No questions available for this exam.</p>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const isLast = currentIndex === questions.length - 1
  const canSubmit = answer.trim().length > 0 && !submitted && !submitting

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grammar Test</h1>
        <div className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2.5">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {pageError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {pageError}
        </div>
      )}

      {savedNotif && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Answer recorded! Moving to next question...
        </div>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <span>Question {currentIndex + 1}</span>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.type === 'multiple_choice' && 'Multiple Choice'}
              {currentQuestion.type === 'fill_blank' && 'Fill in the Blank'}
              {currentQuestion.type === 'error_correction' && 'Correct the Error'}
              {currentQuestion.type === 'sentence_creation' && 'Create a Sentence'}
              {currentQuestion.type === 'scenario' && 'Scenario'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'multiple_choice' && (
            <MultipleChoiceQuestion content={currentQuestion.content} value={answer} onChange={setAnswer} disabled={submitted} />
          )}
          {currentQuestion.type === 'fill_blank' && (
            <FillBlankQuestion content={currentQuestion.content} value={answer} onChange={setAnswer} disabled={submitted} />
          )}
          {currentQuestion.type === 'error_correction' && (
            <ErrorCorrectionQuestion content={currentQuestion.content} value={answer} onChange={setAnswer} disabled={submitted} />
          )}
          {currentQuestion.type === 'sentence_creation' && (
            <SentenceCreationQuestion content={currentQuestion.content} value={answer} onChange={setAnswer} disabled={submitted} />
          )}
          {currentQuestion.type === 'scenario' && (
            <ScenarioQuestion content={currentQuestion.content} value={answer} onChange={setAnswer} disabled={submitted} />
          )}

          {lastResult && submitted && (
            <div className={`mt-6 p-4 rounded-lg border ${lastResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {lastResult.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-semibold ${lastResult.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              {lastResult.explanation && (
                <p className="text-sm text-muted-foreground mt-1">{lastResult.explanation}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Submitting...</>
              ) : (
                'Submit'
              )}
            </Button>
          ) : isLast ? (
            <Button onClick={handleComplete} disabled={completing}>
              {completing ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Completing...</>
              ) : (
                'Complete Exam'
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
