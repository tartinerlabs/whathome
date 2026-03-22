import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRecentRuns } from "@/lib/queries/admin";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight">
          Workflow Runs
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

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <RunsTable />
      </Suspense>
    </div>
  );
}

async function RunsTable() {
  const runs = await getRecentRuns(50);

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
        {runs.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground"
            >
              No runs yet
            </TableCell>
          </TableRow>
        )}
        {runs.map((run) => {
          const durationMs =
            run.startedAt && run.completedAt
              ? run.completedAt.getTime() - run.startedAt.getTime()
              : null;

          return (
            <TableRow key={run.id}>
              <TableCell className="font-mono text-xs">
                <Link
                  href={`/admin/workflows/${run.id}` as never}
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
