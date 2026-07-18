'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useGetExamQuery, useSubmitAnswerMutation, useCompleteExamMutation } from '@/lib/features/exams-api-slice'
import type { Question } from '@/lib/features/exams-api-slice'

function extractContent(content: Record<string, unknown>): {
  questionText: string
  options?: string[]
} {
  const q = (content as any).question || (content as any).sentence || (content as any).scenario || (content as any).instruction || ''
  const options = (content as any).options as string[] | undefined
  return { questionText: q, options }
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
  const { questionText, options } = extractContent(content)
  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">{questionText}</p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="space-y-3">
        {options?.map((opt) => {
          const letter = opt.charAt(0)
          return (
            <div key={letter} className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer has-[button[data-state=checked]]:border-primary">
              <RadioGroupItem value={letter} id={`opt-${letter}`} />
              <Label htmlFor={`opt-${letter}`} className="flex-1 cursor-pointer font-medium text-base">{opt}</Label>
            </div>
          )
        })}
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
  const sentence = (content as any).sentence || ''
  const parts = sentence.split('____')
  return (
    <div className="space-y-6">
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
  const contentData = content as any
  const sentence = contentData.sentence || ''
  const error = contentData.error || ''
  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg border">
        <p className="text-sm text-muted-foreground mb-1">Find and correct the error:</p>
        <p className="text-lg italic">{sentence}</p>
        {error && (
          <p className="text-sm text-destructive mt-2">Error: <strong>{error}</strong></p>
        )}
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
  const contentData = content as any
  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">{contentData.instruction || 'Create a sentence based on the given criteria.'}</p>
      {contentData.criteria && (
        <p className="text-sm text-muted-foreground">Criteria: {contentData.criteria}</p>
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
  const { questionText, options } = extractContent(content)
  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg border">
        <p className="text-lg leading-relaxed">{questionText}</p>
      </div>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="space-y-3">
        {options?.map((opt) => {
          const letter = opt.charAt(0)
          return (
            <div key={letter} className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer has-[button[data-state=checked]]:border-primary">
              <RadioGroupItem value={letter} id={`sc-${letter}`} />
              <Label htmlFor={`sc-${letter}`} className="flex-1 cursor-pointer font-medium text-base">{opt}</Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const { data: examData, isLoading: examLoading, error: examError } = useGetExamQuery(examId)
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

  const exam = examData && typeof examData === 'object' && 'data' in examData
    ? (examData as any).data
    : examData

  const questions: Question[] = exam?.questions || []
  const currentQuestion = questions[currentIndex]
  const isInstantMode = exam?.correctionMode === 'instant'
  const progress = questions.length > 0 ? ((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100 : 0

  useEffect(() => {
    setAnswer('')
    setSubmitted(false)
    setLastResult(null)
    setPageError(null)
  }, [currentIndex])

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || !answer.trim()) return
    setPageError(null)
    try {
      const raw = await submitAnswer({
        examId,
        questionId: currentQuestion.id,
        answer,
      }).unwrap()
      const result = raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw

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
        handleNext()
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { message?: string } }).data?.message ?? 'Failed to submit answer')
          : 'Failed to submit answer'
      setPageError(message)
    }
  }, [currentQuestion, answer, examId, submitAnswer, isInstantMode])

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

  const handleComplete = useCallback(async () => {
    setPageError(null)
    try {
      const raw = await completeExam(examId).unwrap()
      const result = raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw
      if (result) {
        router.push(`/dashboard/results/${examId}`)
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { message?: string } }).data?.message ?? 'Failed to complete exam')
          : 'Failed to complete exam'
      setPageError(message)
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

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <p className="text-muted-foreground">No questions available.</p>
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

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.type === 'multiple_choice' && 'Choose the correct answer'}
            {currentQuestion.type === 'fill_blank' && 'Fill in the blank'}
            {currentQuestion.type === 'error_correction' && 'Correct the error'}
            {currentQuestion.type === 'sentence_creation' && 'Create a sentence'}
            {currentQuestion.type === 'scenario' && 'Scenario question'}
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
