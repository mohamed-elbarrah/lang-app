'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, CheckCircle } from "lucide-react";
import { useGetAdminStatsQuery } from "@/lib/features/dashboard-api-slice";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();

  const totalUsers = stats?.totalUsers?.toLocaleString() ?? "...";
  const totalExams = stats?.totalExams?.toLocaleString() ?? "...";
  const providerName = stats?.activeProvider?.name ?? "None";
  const providerStatus = stats?.activeProvider ? "Operational" : "Not configured";
  const avgScore = stats?.averageScore ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `Average score: ${avgScore !== null ? `${avgScore}%` : "N/A"}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Loading..." : "Across all users"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Provider Status</CardTitle>
            <CheckCircle className={`h-4 w-4 ${stats?.activeProvider ? "text-green-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providerStatus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Loading..." : providerName}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
