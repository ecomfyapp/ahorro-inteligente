import { geolocation } from "@vercel/functions";
import { NextResponse } from "next/server";
import { buildVercelLocation } from "@/lib/location";

export async function GET(request: Request) {
  const ipLocation = buildVercelLocation(geolocation(request));

  if (ipLocation) {
    return NextResponse.json(ipLocation);
  }

  return NextResponse.json({
    location: "Rates available for your area",
    source: "fallback",
    city: null,
    country: null,
    state: null,
    zipCode: null,
    fallback: true,
  });
}
