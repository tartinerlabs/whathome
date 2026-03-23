import type { Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import { auth } from "@/lib/auth";
import { getDataHealthSummary, getWorkflowHistory } from "@/lib/queries/admin";
import { TriggerButton } from "../components/trigger-buttons";

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "default",
  running: "secondary",
  completed: "outline",
  failed: "destructive",
};

export default function WorkflowsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight">
          Data Health
        </h1>
        <div className="flex gap-2">
          <TriggerButton endpoint="/api/workflows/ingest" label="Ingestion" />
          <TriggerButton
            endpoint="/api/workflows/backfill"
            label="Backfill (10)"
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
        <h2 className="mb-4 font-sans text-lg font-bold">Workflow Runs</h2>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <WorkflowHistory />
        </Suspense>
      </div>
    </div>
  );
}

async function HealthCards() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

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

async function WorkflowHistory() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const history = await getWorkflowHistory(50);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground"
            >
              No history yet
            </TableCell>
          </TableRow>
        )}
        {history.map((run) => {
          const durationMs =
            run.startedAt && run.completedAt
              ? run.completedAt.getTime() - run.startedAt.getTime()
              : null;

          return (
            <TableRow key={run.id}>
              <TableCell className="font-mono text-xs">
                <Link
                  href={`/dashboard/workflows/${run.id}` as Route}
                  className="underline"
                >
                  {run.id.slice(0, 8)}
                </Link>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {run.agentType}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[run.status] ?? "default"}>
                  {run.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-xs">
                {run.projectName ?? "\u2014"}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {run.tokensUsed?.toLocaleString() ?? "\u2014"}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {durationMs ? `${(durationMs / 1000).toFixed(1)}s` : "\u2014"}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {run.startedAt?.toLocaleString("en-SG") ?? "\u2014"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
