import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

const ageRejectedCookieName = "bf_age_rejected";
const canonicalHost = "www.better-life.us";
const apexHost = "better-life.us";

function isLocalHost(host: string) {
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0")
  );
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (!isLocalHost(host) && host !== canonicalHost && (host === apexHost || host.endsWith(".vercel.app"))) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = canonicalHost;
    return NextResponse.redirect(url, 308);
  }

  if (
    request.nextUrl.pathname === "/iul-v4" &&
    request.cookies.get(ageRejectedCookieName)?.value === "true"
  ) {
    return NextResponse.redirect(new URL("/iul-v4/rechazo", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp, .avif
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
