import type { Prisma, TagType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BasicTag } from "@/types/api";

export async function getTags(type?: TagType): Promise<BasicTag[]> {
  const where: Prisma.TagWhereInput | undefined = type ? { type } : undefined;
  const tags = await prisma.tag.findMany({
    where,
    orderBy: {
      name: "asc",
    },
  });
  return tags.map((tag) => ({
    id: tag.id,
    slug: tag.slug,
    name: tag.name,
    type: tag.type,
  }));
}
