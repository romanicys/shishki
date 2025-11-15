import { prisma } from "../lib/prisma";

const RUBRICS = [
  {
    slug: "visual-style",
    title: "Визуальный стиль",
    description: "Разбор света, композиции, цветовых палитр и операторских находок.",
    sortOrder: 1,
  },
  {
    slug: "music",
    title: "Музыка и звук",
    description: "Саундтреки, шумы, ритм и музыкальные редакции в кино.",
    sortOrder: 2,
  },
  {
    slug: "shooting",
    title: "Съёмка",
    description: "Камеры, плёнка, объективы, практические приёмы и наблюдения со съёмок.",
    sortOrder: 3,
  },
  {
    slug: "inspiration",
    title: "Вдохновение",
    description: "Сборники, мудборды и параллели между фильмами, фотографами и художниками.",
    sortOrder: 4,
  },
  {
    slug: "quotes",
    title: "Цитаты",
    description: "Высказывания режиссёров, монтажёров и сценаристов о кино.",
    sortOrder: 5,
  },
];

async function main() {
  for (const rubric of RUBRICS) {
    await prisma.rubric.upsert({
      where: { slug: rubric.slug },
      create: rubric,
      update: {
        title: rubric.title,
        description: rubric.description,
        sortOrder: rubric.sortOrder,
      },
    });
  }
  console.log(`Seeded ${RUBRICS.length} rubrics`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
