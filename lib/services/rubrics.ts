import { prisma } from "@/lib/prisma";
import { RubricSummary } from "@/types/api";

export async function getRubrics(): Promise<RubricSummary[]> {
  const rubrics = await prisma.rubric.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });
  return rubrics.map((rubric) => ({
    id: rubric.id,
    slug: rubric.slug,
    title: rubric.title,
    description: rubric.description,
  }));
}
