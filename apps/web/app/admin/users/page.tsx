import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const users = [
    { id: "1", name: "John Doe", email: "john@example.com", tests: 12, joined: "2026-05-10" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", tests: 5, joined: "2026-06-15" },
    { id: "3", name: "Alice Johnson", email: "alice@example.com", tests: 24, joined: "2026-04-20" },
    { id: "4", name: "Bob Brown", email: "bob@example.com", tests: 1, joined: "2026-07-01" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">Manage platform users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search users by name or email..." className="pl-8" />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tests Taken</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.tests}</TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
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
