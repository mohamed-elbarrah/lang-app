'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2, BookOpen, RotateCcw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useStartStudyMutation, useGetStudySessionQuery, useSubmitStudyAnswerMutation, useCompleteStudyMutation } from '@/lib/features/study-api-slice'
import type { StudyAnswer } from '@/lib/features/study-api-slice'
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
  content, value, onChange, disabled,
}: {
  content: Record<string, unknown>; value: string; onChange: (v: string) => void; disabled: boolean
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
  content, value, onChange, disabled,
}: {
  content: Record<string, unknown>; value: string; onChange: (v: string) => void; disabled: boolean
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
  content, value, onChange, disabled,
}: {
  content: Record<string, unknown>; value: string; onChange: (v: string) => void; disabled: boolean
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
  content, value, onChange, disabled,
}: {
  content: Record<string, unknown>; value: string; onChange: (v: string) => void; disabled: boolean
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
  content, value, onChange, disabled,
}: {
  content: Record<string, unknown>; value: string; onChange: (v: string) => void; disabled: boolean
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

export default function StudyLessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string

  const [lessonData, setLessonData] = useState<{ title: string; definition: string; rule: string; examples: string[]; partName: string } | null>(null)
  const [lessonLoading, setLessonLoading] = useState(true)
  const [showContent, setShowContent] = useState(true)

  const [startStudy, { isLoading: starting }] = useStartStudyMutation()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { data: session, isLoading: sessionLoading } = useGetStudySessionQuery(sessionId ?? '', { skip: !sessionId })

  const [submitAnswer, { isLoading: submitting }] = useSubmitStudyAnswerMutation()
  const [completeStudy] = useCompleteStudyMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string | null } | null>(null)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const answers: StudyAnswer[] = session?.answers || []
  const currentAnswer = answers[currentIndex]

  useEffect(() => {
    if (!lessonId) return
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((json) => {
        const data = json.data || json
        if (Array.isArray(data)) {
          for (const part of data) {
            const lesson = part.lessons?.find((l: any) => l.id === lessonId)
            if (lesson) {
              setLessonData({
                title: lesson.title,
                definition: lesson.definition,
                rule: lesson.rule,
                examples: Array.isArray(lesson.examples) ? lesson.examples : [],
                partName: part.name,
              })
              return
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLessonLoading(false))
  }, [lessonId])

  useEffect(() => {
    setAnswer('')
    setFeedback(null)
    setError(null)
  }, [currentIndex])

  useEffect(() => {
    if (!session || completed) return
    if (session.status === 'completed') {
      setCompleted(true)
    }
  }, [session, completed])

  const handleStartExercises = async () => {
    setError(null)
    try {
      const result = await startStudy({ lessonId }).unwrap()
      setSessionId(result.id)
      setShowContent(false)
    } catch {
      setError('Failed to start study session. Please try again.')
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !currentAnswer || !answer.trim()) return
    setError(null)
    try {
      const result = await submitAnswer({
        sessionId,
        exerciseIndex: currentIndex,
        answer,
      }).unwrap()

      setFeedback({
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
      })
    } catch {
      setError('Failed to submit answer.')
    }
  }, [sessionId, currentIndex, currentAnswer, answer, submitAnswer])

  const handleNext = useCallback(async () => {
    if (currentIndex < answers.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      try {
        if (sessionId) {
          await completeStudy(sessionId).unwrap()
          setCompleted(true)
        }
      } catch {
        setError('Failed to complete session.')
      }
    }
  }, [currentIndex, answers.length, sessionId, completeStudy])

  const handleRetry = () => {
    setCompleted(false)
    setSessionId(null)
    setShowContent(true)
    setCurrentIndex(0)
    setAnswer('')
    setFeedback(null)
  }

  if (lessonLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!lessonData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Lesson not found.
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.push('/dashboard/study')}>
              Back to Lessons
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (completed && session) {
    const totalAnswered = session.answers.filter((a) => a.userAnswer != null).length
    const correctCount = session.answers.filter((a) => a.isCorrect === true).length
    const score = session.score ?? Math.round((correctCount / session.answers.length) * 100)

    return (
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold">Lesson Complete!</h1>
        <p className="text-muted-foreground text-lg">{lessonData.title}</p>

        <Card className="max-w-sm mx-auto">
          <CardContent className="pt-6">
            <div className="text-5xl font-bold mb-2">{score}%</div>
            <p className="text-sm text-muted-foreground">
              {correctCount} of {session.answers.length} correct
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
          </Button>
          <Button onClick={() => router.push(`/dashboard/study/review/${sessionId}`)}>
            <ArrowRight className="h-4 w-4 mr-2" /> Review Answers
          </Button>
        </div>
      </div>
    )
  }

  const isGenerating = starting || sessionLoading

  if (isGenerating && !currentAnswer) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <BookOpen className="h-16 w-16 text-primary mx-auto animate-pulse" />
        <h1 className="text-3xl font-bold">Preparing Your Study Session</h1>
        <p className="text-muted-foreground">
          Generating 10 practice exercises based on this lesson...
        </p>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <Button variant="outline" onClick={() => router.push('/dashboard/study')}>
          Cancel
        </Button>
      </div>
    )
  }

  if (showContent) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/study"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lessonData.title}</h1>
            <p className="text-sm text-muted-foreground">{lessonData.partName}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Definition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{lessonData.definition}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grammar Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{lessonData.rule}</p>
          </CardContent>
        </Card>

        {lessonData.examples.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lessonData.examples.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-lg">{ex}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/study')}>
            Back to Lessons
          </Button>
          <Button size="lg" onClick={handleStartExercises} disabled={starting}>
            {starting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting...</>
            ) : (
              <>Start Practice Exercises &rarr;</>
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (!currentAnswer) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">No exercises available.</p>
      </div>
    )
  }

  const isAnswered = feedback != null
  const canSubmit = answer.trim().length > 0 && !isAnswered && !submitting
  const isLast = currentIndex === answers.length - 1

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lessonData.title}</h1>
          <p className="text-sm text-muted-foreground">Practice Exercises</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Exercise {currentIndex + 1} of {answers.length}
        </Badge>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / answers.length) * 100}%` }} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <span>Exercise {currentIndex + 1}</span>
            <Badge variant="secondary" className="text-xs">
              {currentAnswer.type === 'multiple_choice' && 'Multiple Choice'}
              {currentAnswer.type === 'fill_blank' && 'Fill in the Blank'}
              {currentAnswer.type === 'error_correction' && 'Correct the Error'}
              {currentAnswer.type === 'sentence_creation' && 'Create a Sentence'}
              {currentAnswer.type === 'scenario' && 'Scenario'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAnswer.type === 'multiple_choice' && (
            <MultipleChoiceQuestion content={currentAnswer.content} value={answer} onChange={setAnswer} disabled={isAnswered} />
          )}
          {currentAnswer.type === 'fill_blank' && (
            <FillBlankQuestion content={currentAnswer.content} value={answer} onChange={setAnswer} disabled={isAnswered} />
          )}
          {currentAnswer.type === 'error_correction' && (
            <ErrorCorrectionQuestion content={currentAnswer.content} value={answer} onChange={setAnswer} disabled={isAnswered} />
          )}
          {currentAnswer.type === 'sentence_creation' && (
            <SentenceCreationQuestion content={currentAnswer.content} value={answer} onChange={setAnswer} disabled={isAnswered} />
          )}
          {currentAnswer.type === 'scenario' && (
            <ScenarioQuestion content={currentAnswer.content} value={answer} onChange={setAnswer} disabled={isAnswered} />
          )}

          {isAnswered && feedback && (
            <div className={`mt-6 p-4 rounded-lg border ${feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-semibold ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              {!feedback.isCorrect && (
                <p className="text-sm mb-1">
                  Correct answer: <strong>{feedback.correctAnswer}</strong>
                </p>
              )}
              {feedback.explanation && (
                <p className="text-sm text-muted-foreground mt-1">{feedback.explanation}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-2">
            {!isAnswered && (
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Checking...</>
                ) : (
                  'Check Answer'
                )}
              </Button>
            )}

            {isAnswered && (
              <Button onClick={handleNext}>
                {isLast ? 'Complete' : 'Next'} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
