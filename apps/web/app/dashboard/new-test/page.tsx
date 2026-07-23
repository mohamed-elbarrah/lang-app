'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Clock, Search, Check } from "lucide-react"
import Link from "next/link"
import { useCreateExamMutation } from '@/lib/features/exams-api-slice'

interface Lesson {
  id: string
  title: string
  partName: string
}

interface LessonPart {
  id: string
  name: string
  order: number
  lessons: { id: string; title: string }[]
}

const LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Basic recall, simple sentences, one-step grammar rules' },
  { value: 'intermediate', label: 'Intermediate', description: 'Practical application, real-world contexts, moderate complexity' },
  { value: 'advanced', label: 'Advanced', description: 'Complex structures, exceptions, subtle distinctions' },
] as const

function LevelSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Step 1: Choose Difficulty</Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid gap-3">
        {LEVELS.map((level) => (
          <div key={level.value} className="relative">
            <RadioGroupItem value={level.value} id={`level-${level.value}`} className="peer sr-only" />
            <Label
              htmlFor={`level-${level.value}`}
              className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors
                peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                hover:bg-muted/50"
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                ${value === level.value ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                {value === level.value && <Check className="h-3 w-3" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{level.label}</div>
                <div className="text-sm text-muted-foreground">{level.description}</div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

function LessonSearchSelect({
  lessons,
  selectedIds,
  onToggle,
}: {
  lessons: Lesson[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return lessons
    const q = search.toLowerCase()
    return lessons.filter(
      (l) => l.title.toLowerCase().includes(q) || l.partName.toLowerCase().includes(q),
    )
  }, [lessons, search])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Step 2: Choose Topics</Label>
        {selectedIds.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedIds.length} selected
          </Badge>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border divide-y">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {search ? 'No lessons match your search.' : 'No lessons available.'}
          </div>
        ) : (
          filtered.map((lesson) => {
            const selected = selectedIds.includes(lesson.id)
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onToggle(lesson.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors
                  ${selected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border
                  ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  {selected && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{lesson.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{lesson.partName}</div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {selectedIds.length === 0 && (
        <p className="text-xs text-muted-foreground">Select at least one lesson to continue.</p>
      )}
    </div>
  )
}

export default function NewTestPage() {
  const router = useRouter()
  const [createExam, { isLoading }] = useCreateExamMutation()

  const [level, setLevel] = useState('beginner')
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState('10')
  const [correctionMode, setCorrectionMode] = useState('final')
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((json) => {
        const data = json.data || json
        if (Array.isArray(data)) {
          const flattened = data.flatMap((part: LessonPart) =>
            part.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              partName: part.name,
            })),
          )
          setAllLessons(flattened)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (selectedLessonIds.length === 0) {
      setError('Please select at least one lesson.')
      return
    }

    setError(null)
    setGenerating(true)
    try {
      const exam = await createExam({
        level: level as 'beginner' | 'intermediate' | 'advanced',
        lessonIds: selectedLessonIds,
        questionCount: parseInt(questionCount, 10),
        correctionMode: correctionMode as 'instant' | 'final',
      }).unwrap()
      router.push(`/dashboard/test/${exam.id}`)
    } catch (err: unknown) {
      setGenerating(false)
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error?: { message?: string } } }).data?.error?.message ?? 'Failed to create exam')
          : 'Failed to create exam'
      setError(message)
    }
  }

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId],
    )
  }

  if (generating) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
        <Clock className="h-16 w-16 text-primary mx-auto animate-pulse" />
        <h1 className="text-3xl font-bold">Generating Your Exam</h1>
        <p className="text-muted-foreground">
          Please wait while we prepare your questions using AI. This may take a few seconds...
        </p>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <Button variant="outline" onClick={() => { setGenerating(false); router.push('/dashboard') }}>
          Cancel
        </Button>
      </div>
    )
  }

  const canSubmit = selectedLessonIds.length > 0

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Test</h1>
        <p className="text-muted-foreground mt-1">Configure your AI-generated grammar test.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Settings</CardTitle>
          <CardDescription>Choose difficulty, topics, and preferences for your test.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <LevelSelector value={level} onChange={setLevel} />

          <LessonSearchSelect
            lessons={allLessons}
            selectedIds={selectedLessonIds}
            onToggle={toggleLesson}
          />

          <div className="space-y-6 pt-4 border-t">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Step 3: Settings</Label>

              <div className="space-y-3">
                <Label>Number of Questions</Label>
                <Select value={questionCount} onValueChange={(v) => v && setQuestionCount(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions (Quick)</SelectItem>
                    <SelectItem value="5">5 Questions (Mini)</SelectItem>
                    <SelectItem value="10">10 Questions (Standard)</SelectItem>
                    <SelectItem value="15">15 Questions (Extended)</SelectItem>
                    <SelectItem value="20">20 Questions (Comprehensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Correction Mode</Label>
                <RadioGroup value={correctionMode} onValueChange={setCorrectionMode} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="instant" id="instant" />
                    <Label htmlFor="instant" className="flex-1 cursor-pointer">
                      <div className="font-semibold mb-1">Instant Correction</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        See feedback after each answer, then acknowledge before moving on.
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="final" id="final" />
                    <Label htmlFor="final" className="flex-1 cursor-pointer">
                      <div className="font-semibold mb-1">Final Review</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Answer all questions first, then review everything at the end.
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !canSubmit}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating...</>
            ) : (
              'Start Exam'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
