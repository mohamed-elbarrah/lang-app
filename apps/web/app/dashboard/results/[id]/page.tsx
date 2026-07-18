import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResultDetailsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/results"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Result</h1>
          <p className="text-muted-foreground mt-1">Completed on July 18, 2026</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 bg-primary/5 border-primary/20">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="text-sm font-medium text-muted-foreground mb-2">Final Score</div>
            <div className="text-5xl font-bold text-primary mb-2">80%</div>
            <Badge className="mt-2">Good Job</Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Total Questions</span>
              <p className="font-medium text-lg">10</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Correct Answers</span>
              <p className="font-medium text-lg text-green-600">8</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Incorrect Answers</span>
              <p className="font-medium text-lg text-red-600">2</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Topics to Review</span>
              <p className="font-medium text-lg">Past Perfect Tense</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold mt-8">Review Answers</h2>
        
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Question 1</CardTitle>
              <CheckCircle2 className="text-green-600 h-6 w-6" />
            </div>
            <CardDescription className="text-base text-foreground mt-2">
              "By the time we arrived, they _______ already eaten."
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 bg-background rounded border text-sm flex items-center justify-between">
                <span>Your answer: <strong>had</strong></span>
                <Badge variant="outline" className="text-green-600 border-green-200">Correct</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Question 2</CardTitle>
              <XCircle className="text-red-600 h-6 w-6" />
            </div>
            <CardDescription className="text-base text-foreground mt-2">
              "If I _______ rich, I would travel the world."
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-3 bg-background rounded border text-sm">
                Your answer: <strong className="text-red-600 line-through mr-2">was</strong>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-200 text-sm">
                Correct answer: <strong className="text-green-700">were</strong>
              </div>
            </div>
            <div className="bg-background p-4 rounded border text-sm">
              <p className="font-semibold mb-1">AI Explanation:</p>
              <p className="text-muted-foreground">In the second conditional (used for unreal or hypothetical situations), the correct form of the verb 'to be' for all subjects is 'were', not 'was'. This is a common rule in formal English.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
