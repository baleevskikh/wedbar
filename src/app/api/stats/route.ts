import { getStats } from "@/lib/repositories";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ stats: getStats() });
}
