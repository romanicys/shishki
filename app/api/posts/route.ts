import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/services/posts";
import { PostType } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 12;
const ALLOWED_TYPES: Array<PostType> = [
  "ARTICLE",
  "REVIEW",
  "NEWS",
  "GALLERY",
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE.toString());
  const tag = searchParams.get("tag") ?? undefined;
  const query = searchParams.get("query") ?? undefined;
  const rubric = searchParams.get("rubric") ?? undefined;
  const typeParam = searchParams.get("type");
  const type = typeParam && ALLOWED_TYPES.includes(typeParam as PostType)
    ? (typeParam as PostType)
    : undefined;

  const response = await getPosts({
    page,
    pageSize,
    tag,
    query,
    rubric,
    type,
  });
  return NextResponse.json(response);
}
