import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDataHealthSummary, getRecentRuns } from "@/lib/queries/admin";
import { TriggerButton } from "./components/trigger-buttons";

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "default",
  running: "secondary",
  completed: "outline",
  failed: "destructive",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight">
          Dashboard
        </h1>
        <div className="flex gap-2">
          <TriggerButton
            endpoint="/api/workflows/ingest"
            label="Run Ingestion"
          />
          <TriggerButton
            endpoint="/api/workflows/backfill"
            label="Run Backfill"
            body={{ batchSize: 10 }}
          />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        }
      >
        <HealthCards />
      </Suspense>

      <div>
        <h2 className="mb-4 font-sans text-lg font-bold">Recent Runs</h2>
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <RecentRunsTable />
        </Suspense>
      </div>
    </div>
  );
}

async function HealthCards() {
  const health = await getDataHealthSummary();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xs text-muted-foreground">
            Total Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-sans text-3xl font-bold">
            {health.totalProjects.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xs text-muted-foreground">
            Researched
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-sans text-3xl font-bold">
            {health.researchedProjects.toLocaleString()}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {health.unresearchedProjects.toLocaleString()} remaining
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xs text-muted-foreground">
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-sans text-3xl font-bold">
            {health.totalTransactions.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xs text-muted-foreground">
            Last Ingestion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm">
            {health.latestIngestion
              ? health.latestIngestion.toLocaleDateString("en-SG")
              : "Never"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentRunsTable() {
  const recentRuns = await getRecentRuns(10);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentRuns.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              No runs yet
            </TableCell>
          </TableRow>
        )}
        {recentRuns.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="font-mono text-xs">
              <Link
                href={`/admin/workflows/${run.id}` as never}
                className="underline"
              >
                {run.agentType}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[run.status] ?? "default"}>
                {run.status}
              </Badge>
            </TableCell>
            <TableCell className="text-xs">
              {run.projectName ?? "\u2014"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {run.tokensUsed?.toLocaleString() ?? "\u2014"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {run.startedAt?.toLocaleDateString("en-SG") ?? "\u2014"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
