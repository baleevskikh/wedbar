import { getStats } from "@/lib/repositories";
import { errorResponse } from "@/lib/errors";
import { requireStaffToken } from "@/lib/staff-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireStaffToken(request, "admin");
    return Response.json({ stats: getStats() });
  } catch (error) {
    return errorResponse(error);
  }
}
