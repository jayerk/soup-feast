import { NextRequest, NextResponse } from "next/server";
import { generateToken, getAdminCookieName } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = generateToken(password);
  const response = NextResponse.json({ success: true });

  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
