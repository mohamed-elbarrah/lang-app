import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span>Admin Area</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-muted text-foreground">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link href="/admin/ai-provider" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
            AI Provider
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
            <Link href="/dashboard">
              <LogOut className="h-4 w-4 mr-2" />
              Exit Admin
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center px-6 justify-between md:justify-end shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg md:hidden">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span>Admin Area</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:block">Admin User</div>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              A
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
  );
}
