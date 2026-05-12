import { NextResponse } from "next/server";

export const leadTokenCookieName = "bf_lead_token";

export async function GET() {
  const token = crypto.randomUUID();
  const response = NextResponse.json({ token });

  response.cookies.set(leadTokenCookieName, token, {
    httpOnly: true,
    maxAge: 30 * 60,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
