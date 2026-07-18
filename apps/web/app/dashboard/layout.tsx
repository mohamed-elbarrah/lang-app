'use client'

import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, FileText, History, User as UserIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { useLogoutMutation } from "@/lib/features/auth-api-slice";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/auth-guard";
import SessionProvider from "@/components/auth/session-provider";

function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((s) => s.auth)
  const [logout] = useLogoutMutation()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      router.replace('/')
    } catch {
      router.replace('/')
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span>GrammarAI</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-muted text-foreground">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/new-test" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <FileText className="h-4 w-4" />
            New Test
          </Link>
          <Link href="/dashboard/results" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <History className="h-4 w-4" />
            Results
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <UserIcon className="h-4 w-4" />
            Profile
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center px-6 justify-between md:justify-end shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg md:hidden">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span>GrammarAI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:block">{user?.email}</div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthGuard>
        <DashboardSidebar>
          {children}
        </DashboardSidebar>
      </AuthGuard>
    </SessionProvider>
  );
}
