import { ForbiddenError } from "./errors";

type StaffRole = "admin" | "bartender";

const STAFF_TOKEN_HEADER = "x-wedbar-token";

function tokenForRole(role: StaffRole) {
  return role === "admin" ? process.env.ADMIN_SLUG : process.env.BARTENDER_SLUG;
}

export function requireStaffToken(request: Request, role: StaffRole) {
  const expected = tokenForRole(role);
  const actual = request.headers.get(STAFF_TOKEN_HEADER);

  if (!expected || actual !== expected) {
    throw new ForbiddenError();
  }
}

export function requireAnyStaffToken(request: Request) {
  const actual = request.headers.get(STAFF_TOKEN_HEADER);
  const allowed = [process.env.ADMIN_SLUG, process.env.BARTENDER_SLUG].filter(Boolean);

  if (!actual || !allowed.includes(actual)) {
    throw new ForbiddenError();
  }
}
