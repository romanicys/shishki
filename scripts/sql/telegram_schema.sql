-- Схема хранения данных Telegram в PostgreSQL
-- Подходит для пайплайна: RAW (raw_posts) -> PARSED (parsed_posts) -> аналитика/ML

CREATE TABLE IF NOT EXISTS raw_posts (
    message_id      BIGINT PRIMARY KEY,
    channel_id      BIGINT,
    message_date    TIMESTAMPTZ,
    message_text    TEXT,
    media           JSONB           NOT NULL DEFAULT '[]'::jsonb,
    payload         JSONB           NOT NULL,
    imported_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_posts_date ON raw_posts (message_date DESC);

CREATE TABLE IF NOT EXISTS parsed_posts (
    id              BIGSERIAL PRIMARY KEY,
    message_id      BIGINT          NOT NULL REFERENCES raw_posts(message_id) ON DELETE CASCADE,
    slug            TEXT            NOT NULL UNIQUE,
    title           TEXT            NOT NULL,
    subtitle        TEXT,
    post_type       TEXT            NOT NULL CHECK (post_type IN ('ARTICLE', 'REVIEW', 'NEWS', 'GALLERY')),
    published_at    TIMESTAMPTZ     NOT NULL,
    excerpt         TEXT,
    rubric_slug     TEXT,
    hero_media      JSONB,
    entities        JSONB           NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parsed_posts_published_at ON parsed_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_parsed_posts_rubric_slug ON parsed_posts (rubric_slug);

CREATE TABLE IF NOT EXISTS parsed_post_media (
    id                  BIGSERIAL PRIMARY KEY,
    post_id             BIGINT      NOT NULL REFERENCES parsed_posts(id) ON DELETE CASCADE,
    telegram_media_id   BIGINT      NOT NULL,
    sort_order          INT         NOT NULL DEFAULT 0,
    media_type          TEXT        NOT NULL CHECK (media_type IN ('image', 'video')),
    file_path           TEXT,
    original_filename   TEXT,
    caption             TEXT,
    width               INT,
    height              INT,
    metadata            JSONB,
    UNIQUE (post_id, telegram_media_id)
);

CREATE INDEX IF NOT EXISTS idx_parsed_post_media_post_sort ON parsed_post_media (post_id, sort_order);

CREATE TABLE IF NOT EXISTS films (
    id              BIGSERIAL PRIMARY KEY,
    slug            TEXT            NOT NULL UNIQUE,
    title           TEXT            NOT NULL,
    normalized_title TEXT,
    original_title  TEXT,
    release_year    INT,
    countries       TEXT[],
    alias_id        TEXT,
    source          TEXT            NOT NULL DEFAULT 'detected',
    tmdb_id         BIGINT,
    overview        TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_films_year ON films (release_year);
CREATE INDEX IF NOT EXISTS idx_films_tmdb_id ON films (tmdb_id);

CREATE TABLE IF NOT EXISTS parsed_post_films (
    post_id         BIGINT          NOT NULL REFERENCES parsed_posts(id) ON DELETE CASCADE,
    film_id         BIGINT          NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    relation_type   TEXT,
    highlight       BOOLEAN         NOT NULL DEFAULT FALSE,
    PRIMARY KEY (post_id, film_id)
);

CREATE TABLE IF NOT EXISTS topics (
    slug            TEXT            PRIMARY KEY,
    label           TEXT            NOT NULL,
    topic_type      TEXT            NOT NULL CHECK (topic_type IN ('hashtag', 'rubric')),
    post_count      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parsed_post_topics (
    post_id     BIGINT  NOT NULL REFERENCES parsed_posts(id) ON DELETE CASCADE,
    topic_slug  TEXT    NOT NULL REFERENCES topics(slug) ON DELETE CASCADE,
    PRIMARY KEY (post_id, topic_slug)
);

CREATE INDEX IF NOT EXISTS idx_parsed_post_topics_topic ON parsed_post_topics (topic_slug);
