import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function TestPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grammar Test</h1>
        <div className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
          Question 3 of 10
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2.5">
        <div className="bg-primary h-2.5 rounded-full" style={{ width: '30%' }}></div>
      </div>

      <Card className="mt-8 border-2">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            Choose the correct verb tense for this sentence: "By the time we arrived, they _______ already eaten."
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="" className="space-y-3">
            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="a" id="r1" />
              <Label htmlFor="r1" className="flex-1 cursor-pointer font-medium text-base">has</Label>
            </div>
            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="b" id="r2" />
              <Label htmlFor="r2" className="flex-1 cursor-pointer font-medium text-base">have</Label>
            </div>
            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="c" id="r3" />
              <Label htmlFor="r3" className="flex-1 cursor-pointer font-medium text-base">had</Label>
            </div>
            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="d" id="r4" />
              <Label htmlFor="r4" className="flex-1 cursor-pointer font-medium text-base">was</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" disabled>Previous</Button>
          <Button asChild>
             <Link href="/dashboard/results/123">Submit & Next</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
