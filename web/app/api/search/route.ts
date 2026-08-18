import { NextResponse } from "next/server";
import { searchCms } from "@/lib/search";

const MAX_SUGGESTIONS = 6;

/**
 * Instant-results endpoint for the hero search bar. Failures return an
 * empty list rather than an error: suggestions are a progressive
 * enhancement, and the full results page reports CMS trouble properly.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  try {
    const results = await searchCms(q, {
      resourcesOnly: params.get("scope") === "resources",
    });
    return NextResponse.json({ results: results.slice(0, MAX_SUGGESTIONS) });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
