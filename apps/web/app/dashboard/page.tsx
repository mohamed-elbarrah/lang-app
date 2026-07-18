import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Welcome back, User</CardTitle>
            <CardDescription>Ready to improve your English grammar today?</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/dashboard/new-test">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start New Test
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Tests Completed</span>
              <span className="font-bold text-xl">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Avg. Score</span>
              <span className="font-bold text-xl">85%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Results</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Grammar Test #{14 - i}</CardTitle>
                <CardDescription>2 days ago</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Score: </span>
                    <span className="font-bold">{90 - i * 5}%</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/results/${i}`}>Review</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/results">View All Results</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
