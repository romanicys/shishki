import { TagType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getTags } from "@/lib/services/tags";

export async function GET(request: NextRequest) {
  const typeParam = request.nextUrl.searchParams.get("type") ?? undefined;
  const type = typeParam && Object.values(TagType).includes(typeParam as TagType)
    ? (typeParam as TagType)
    : undefined;
  const tags = await getTags(type);
  return NextResponse.json(tags);
}
