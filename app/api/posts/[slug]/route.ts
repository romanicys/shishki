import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/services/posts";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
  }
  return NextResponse.json(post);
}
