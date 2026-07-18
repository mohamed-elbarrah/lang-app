import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function NewTestPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Test</h1>
        <p className="text-muted-foreground mt-1">Configure your AI-generated grammar test.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Settings</CardTitle>
          <CardDescription>Choose how you want your test to be generated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Number of Questions</Label>
            <Select defaultValue="10">
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
            <RadioGroup defaultValue="instant" className="flex flex-col space-y-2">
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
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/test/123">Start Exam</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
