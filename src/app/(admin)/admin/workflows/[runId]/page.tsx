import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRunById } from "@/lib/queries/admin";

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "default",
  running: "secondary",
  completed: "outline",
  failed: "destructive",
};

export function generateStaticParams() {
  return [{ runId: "__placeholder__" }];
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/workflows"
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          &larr; All Runs
        </Link>
        <h1 className="font-sans text-2xl font-extrabold tracking-tight">
          Run Detail
        </h1>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <RunContent runId={runId} />
      </Suspense>
    </div>
  );
}

async function RunContent({ runId }: { runId: string }) {
  const run = await getRunById(runId);

  if (!run) notFound();

  const durationMs =
    run.startedAt && run.completedAt
      ? run.completedAt.getTime() - run.startedAt.getTime()
      : null;

  return (
    <>
      <Badge variant={statusVariant[run.status] ?? "default"}>
        {run.status}
      </Badge>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-[10px] text-muted-foreground">
              Workflow Type
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm font-bold">
            {run.agentType}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-[10px] text-muted-foreground">
              Project
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {run.projectSlug ? (
              <Link
                href={`/projects/${run.projectSlug}` as never}
                className="underline"
              >
                {run.projectName}
              </Link>
            ) : (
              (run.projectName ?? "\u2014")
            )}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-[10px] text-muted-foreground">
              Tokens Used
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm font-bold">
            {run.tokensUsed?.toLocaleString() ?? "\u2014"}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-[10px] text-muted-foreground">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm font-bold">
            {durationMs ? `${(durationMs / 1000).toFixed(1)}s` : "\u2014"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xs">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{run.createdAt.toLocaleString("en-SG")}</span>
          </div>
          {run.startedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Started</span>
              <span>{run.startedAt.toLocaleString("en-SG")}</span>
            </div>
          )}
          {run.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span>{run.completedAt.toLocaleString("en-SG")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {run.errorMessage && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="font-mono text-xs text-destructive">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs text-destructive">
              {run.errorMessage}
            </pre>
          </CardContent>
        </Card>
      )}

      {run.outputSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-xs">Output Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(run.outputSummary), null, 2);
                } catch {
                  return run.outputSummary;
                }
              })()}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xs">Input Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">
            {JSON.stringify(run.inputPayload, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}
