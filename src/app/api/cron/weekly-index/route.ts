export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorised", { status: 401 });
  }

  // Placeholder — price indices will be derived from transaction data in a future step
  return Response.json({ status: "not_yet_implemented" });
}
