'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useCreateExamMutation } from '@/lib/features/exams-api-slice'

interface LessonPart {
  id: string
  name: string
  order: number
}

export default function NewTestPage() {
  const router = useRouter()
  const [createExam, { isLoading }] = useCreateExamMutation()
  const [questionCount, setQuestionCount] = useState('10')
  const [correctionMode, setCorrectionMode] = useState('final')
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [parts, setParts] = useState<LessonPart[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((json) => {
        const data = json.data || json
        if (Array.isArray(data)) {
          setParts(data.map((p: LessonPart) => ({ id: p.id, name: p.name, order: p.order })))
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    setError(null)
    try {
      const raw = await createExam({
        questionCount: parseInt(questionCount, 10),
        partIds: selectedParts.length > 0 ? selectedParts : undefined,
        correctionMode: correctionMode as 'instant' | 'final',
      }).unwrap()

      const exam = raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw
      router.push(`/dashboard/test/${exam.id}`)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { message?: string } }).data?.message ?? 'Failed to create exam')
          : 'Failed to create exam'
      setError(message)
    }
  }

  const togglePart = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId],
    )
  }

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
          <CardDescription>Choose how you want your test to be generated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Number of Questions</Label>
            <Select value={questionCount} onValueChange={(v) => v && setQuestionCount(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 Questions (Quick)</SelectItem>
                <SelectItem value="15">15 Questions (Standard)</SelectItem>
                <SelectItem value="20">20 Questions (Comprehensive)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">The test must have between 10 and 20 questions.</p>
          </div>

          <div className="space-y-3">
            <Label>Correction Mode</Label>
            <RadioGroup value={correctionMode} onValueChange={setCorrectionMode} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="instant" id="instant" />
                <Label htmlFor="instant" className="flex-1 cursor-pointer">
                  <div className="font-semibold mb-1">Instant Correction</div>
                  <div className="text-sm text-muted-foreground font-normal">Get feedback immediately after answering each question.</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="final" id="final" />
                <Label htmlFor="final" className="flex-1 cursor-pointer">
                  <div className="font-semibold mb-1">Final Review</div>
                  <div className="text-sm text-muted-foreground font-normal">See all corrections and explanations only at the end.</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {parts.length > 0 && (
            <div className="space-y-3">
              <Label>Lesson Groups (optional)</Label>
              <p className="text-sm text-muted-foreground">Select specific grammar areas to focus on. Leave empty for random selection.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {parts.map((part) => {
                  const active = selectedParts.includes(part.id)
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => togglePart(part.id)}
                      className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted/50 border-border'
                      }`}
                    >
                      {part.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
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
