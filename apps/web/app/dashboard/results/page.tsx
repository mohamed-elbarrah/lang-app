'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"
import { useGetResultsQuery } from '@/lib/features/results-api-slice'

export default function ResultsPage() {
  const [search, setSearch] = useState('')
  const { data: results, isLoading, error, refetch } = useGetResultsQuery({ page: 1, limit: 50 })

  const list = results?.data || []
  const filtered = search
    ? list.filter((r: any) =>
        new Date(r.completedAt || r.createdAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : list

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
          <p className="text-muted-foreground mt-1">Review your past performance.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new-test">New Test</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>A list of all the exams you&apos;ve taken so far.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by date..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Failed to load results.</p>
              <Button variant="outline" onClick={refetch}>Retry</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                {search ? 'No results match your search.' : 'No results yet. Complete a test to see your results here.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((result: any) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.completedAt
                          ? new Date(result.completedAt).toLocaleDateString()
                          : new Date(result.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={result.score != null && result.score >= 80 ? 'default' : result.score != null && result.score >= 60 ? 'secondary' : 'destructive'}
                        >
                          {result.score != null ? `${result.score}%` : '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{result.correctionMode}</TableCell>
                      <TableCell>{result.questionCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/results/${result.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
