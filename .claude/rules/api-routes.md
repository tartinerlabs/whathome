---
paths:
  - "src/app/api/**/*"
---

# API Route Rules

## Route Handler Exports
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Always return `NextResponse.json()` with appropriate status codes
- Use `Response.json()` for simple responses

## Error Response Format
```typescript
{ error: string, details?: string }
```
Always return structured error objects, never plain strings.

## Cron Routes (`src/app/api/cron/`)
- Validate `CRON_SECRET` header on every cron endpoint:
```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Agent Routes (`src/app/api/agents/`)
- Log every run to `research_runs` table (start, complete, or fail)
- Include `tokensUsed` and `costUsd` in completion logs
- Return run ID in response for tracking

## Streaming Patterns
- Use `streamText` from AI SDK for AI responses
- Return via `toUIMessageStreamResponse()` for chat UIs
- Use `Response` with `ReadableStream` for custom streaming
