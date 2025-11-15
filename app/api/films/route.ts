import { NextRequest, NextResponse } from "next/server";
import { getFilms } from "@/lib/services/films";

const DEFAULT_PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE.toString());
  const tag = searchParams.get("tag") ?? undefined;
  const query = searchParams.get("query") ?? undefined;
  const year = searchParams.get("year");

  const response = await getFilms({
    page,
    pageSize,
    tag,
    query,
    year: year ? Number(year) : undefined,
  });
  return NextResponse.json(response);
}
