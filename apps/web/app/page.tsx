import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center border-b px-6 justify-between shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <span>GrammarAI</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline">
            Login
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-24 lg:py-32 flex flex-col items-center text-center px-4">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Master English Grammar with AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Generate unlimited, personalized grammar exams based on approved lessons. Get instant AI-powered corrections and improve your skills faster.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link href="/register">Start Learning Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/50 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Configure Exam</h3>
                <p className="text-muted-foreground">Choose how many questions you want and your preferred correction mode.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Answer Questions</h3>
                <p className="text-muted-foreground">Take the unique, AI-generated exam with various question types.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Get Feedback</h3>
                <p className="text-muted-foreground">Review detailed explanations and learn from your mistakes instantly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} GrammarAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
