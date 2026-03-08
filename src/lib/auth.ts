import { cookies } from "next/headers";

const ADMIN_COOKIE = "soup-feast-admin";

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  // Simple token verification - compare with hashed password token
  return token === generateToken(process.env.ADMIN_PASSWORD || "");
}

export function generateToken(password: string): string {
  // Simple hash for session token
  let hash = 0;
  const str = password + (process.env.JWT_SECRET || "soup-feast-secret");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36) + "-" + Buffer.from(str).toString("base64url").slice(0, 32);
}

export function getAdminCookieName(): string {
  return ADMIN_COOKIE;
}
