import { NextRequest, NextResponse } from "next/server";
import { getFilmBySlug } from "@/lib/services/films";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const film = await getFilmBySlug(slug);
  if (!film) {
    return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
  }
  return NextResponse.json(film);
}
