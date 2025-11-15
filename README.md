# ШишКИНО 2.0

Каталог фильмов и телеграм-постов в стиле «Кинопоиск-лайт». Источник данных — JSON + папка изображений из Telegram, которые импортируются в локальную SQLite через Prisma, а Next.js App Router выступает и API, и фронтендом.

## Стек
- Next.js 16 (App Router, RSC)
- TypeScript + TailwindCSS 4 + shadcn/ui-компоненты
- Prisma + SQLite (единый `dev.db`)
- Zod / Superjson для валидации/сериализации

## Структура
```
shishkino-next/
├── app/                # Страницы и API маршруты Next.js
├── components/         # UI-компоненты, перенесённые из прошлой версии
├── lib/                # Prisma-клиент и вспомогательные утилиты
├── prisma/             # schema.prisma, миграции и seed-скрипты
├── scripts/            # Импортёр из Telegram (будет позже)
├── types/              # Общие DTO/контракты
└── README.md
```

## Переменные окружения
Скопируйте `.env.example` в `.env` и при необходимости поменяйте значения:

```
cp .env.example .env
```

- `DATABASE_URL` — путь до SQLite файла (`file:./prisma/dev.db`).
- `ASSET_BASE_URL` — адрес для отдачи изображений (локально `http://localhost:3000`).
- `IMPORT_JSON_PATH` / `IMPORT_MEDIA_DIR` — пути к JSON и папке c изображениями из Telegram.
- `TMDB_API_KEY` — (опционально) ключ TMDB v3 для обогащения фильмов.
- `TELEGRAM_ETL_OUT` — каталог для выгрузки RAW/PARSED датасетов (`data/etl`).
- `TELEGRAM_ETL_SINCE` / `TELEGRAM_ETL_LIMIT` — ограничения для выборки при ETL.

## Запуск в разработке
```bash
npm install
npm run dev
```
Откройте http://localhost:3000.

## Сценарии npm
| Скрипт          | Назначение |
|-----------------|------------|
| `npm run dev`   | Dev-сервер Next.js |
| `npm run build` | Продовая сборка |
| `npm run start` | Запуск собранного приложения |
| `npm run lint`  | ESLint |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate`  | `prisma migrate dev` |
| `npm run db:push`     | `prisma db push` |
| `npm run db:seed`     | Запуск `prisma/seed.ts` |
| `npm run import`      | Импорт данных (будет реализован на этапе 3) |

## Импорт и ETL данных из Telegram
1. Поместите JSON с экспортом Telegram и папку с изображениями (структура как в оригинальном архиве).
2. Укажите пути в `.env` (`IMPORT_JSON_PATH`, `IMPORT_MEDIA_DIR`) или передайте флаги:
   ```bash
   npm run import -- --json ./path/to/media_metadata.json --media ./path/to/media_folder
   ```
3. Для построения RAW/PARSED датасетов и первичного анализа:
   ```bash
   npm run telegram:etl -- --json ./path/to/media_metadata.json --out ./data/etl
   ```
   Скрипт создаст NDJSON-файлы (`raw_posts`, `parsed_posts`, `films`, `topics`) и подготовит данные к загрузке в Postgres.
4. Скрипт импорта в Prisma:
   - группирует записи по `message_id`,
   - определяет тип поста (обзор/новость/галерея),
   - извлекает теги по хэштегам,
   - пытается найти название фильма в тексте,
   - копирует изображения в `public/images`,
   - создаёт/обновляет Post/Film/Tag/Media и связи.

## Текущее состояние
- ✅ Этап 1: старт проекта, перенос UI-компонентов, базовая настройка окружения.
- ✅ Этап 2: Prisma-схема под SQLite + начальная миграция.
- ⏳ Этап 3: импортёр JSON → SQLite + копирование изображений.
- ⏳ Этап 4: API маршруты и сервисный слой.
- ⏳ Этап 5: Каталог, карточки и поиск.
- ⏳ Этап 6: Тесты и финальная проверка.

Дальше будем заполнять базу и строить API/страницы.
# shishkino
# shishkino-next
# shishkino-next
# shishkino-next
# shishkino-next
