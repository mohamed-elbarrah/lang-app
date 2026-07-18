import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  const results = [
    { id: "1", date: "2026-07-18", score: 85, mode: "Instant", questions: 10 },
    { id: "2", date: "2026-07-16", score: 92, mode: "Final", questions: 15 },
    { id: "3", date: "2026-07-10", score: 70, mode: "Instant", questions: 10 },
    { id: "4", date: "2026-07-05", score: 100, mode: "Final", questions: 20 },
  ];

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
          <CardDescription>A list of all the exams you've taken so far.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search results..." className="pl-8" />
            </div>
          </div>
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
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.date}</TableCell>
                    <TableCell>
                      <Badge variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}>
                        {result.score}%
                      </Badge>
                    </TableCell>
                    <TableCell>{result.mode}</TableCell>
                    <TableCell>{result.questions}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
