import { geolocation } from "@vercel/functions";
import { NextResponse } from "next/server";
import { buildVercelLocation, type ResolvedLocation } from "@/lib/location";

type ZipApiResponse = {
  "post code"?: string;
  places?: Array<{
    "place name"?: string;
    state?: string;
  }>;
};

const ZIP_LOOKUP_TIMEOUT_MS = 1500;

async function lookupZip(zip: string): Promise<ResolvedLocation | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ZIP_LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ZipApiResponse;
    const place = data.places?.[0];

    if (!place?.["place name"] || !place.state) {
      return null;
    }

    return {
      location: `${place["place name"]}, ${place.state}`,
      source: "zippopotam",
      city: place["place name"],
      country: "US",
      state: place.state,
      zipCode: data["post code"] || zip,
      fallback: false,
    };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return null;
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ zip: string }> }
) {
  const { zip } = await context.params;

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid ZIP code" }, { status: 400 });
  }

  const zipLocation = await lookupZip(zip);

  if (zipLocation) {
    return NextResponse.json(zipLocation);
  }

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
