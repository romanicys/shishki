"""Поиск упоминаний фильмов в тексте."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Sequence

from rapidfuzz import fuzz, process

from .aliases import FilmAliasResolver, FilmRecord
from .config import FilmAliasConfig
from .preprocessing import normalize_text

_WORD_RE = re.compile(r"\b[\w'-]+\b", flags=re.UNICODE)


@dataclass(slots=True, frozen=True)
class FilmMention:
    """Структурированное упоминание фильма в тексте."""

    film: FilmRecord
    text: str
    score: float
    start: int
    end: int


class FilmMentionDetector:
    """Находит упоминания фильмов с использованием алиасов и размытого поиска."""

    def __init__(
        self,
        resolver: FilmAliasResolver | None = None,
        *,
        config: FilmAliasConfig | None = None,
    ) -> None:
        self.resolver = resolver or FilmAliasResolver(config)
        if not self.resolver.aliases:
            self.resolver.load()
        self._alias_keys: Sequence[str] = tuple(self.resolver.aliases)
        self._threshold = self.resolver.config.match_threshold
        self._max_window = self.resolver.max_alias_tokens

    def detect(self, text: str) -> list[FilmMention]:
        """Извлекает упоминания фильмов из произвольного текста."""

        tokens: list[tuple[str, int, int, str]] = []
        for match in _WORD_RE.finditer(text):
            original = match.group(0)
            normalized = normalize_text(original)
            if not normalized:
                continue
            tokens.append((original, match.start(), match.end(), normalized))

        mentions: dict[tuple[int, int], FilmMention] = {}
        total_tokens = len(tokens)
        if total_tokens == 0:
            return []

        for start_idx in range(total_tokens):
            for window in range(1, self._max_window + 1):
                end_idx = start_idx + window
                if end_idx > total_tokens:
                    break
                normalized_phrase = " ".join(t[3] for t in tokens[start_idx:end_idx])
                if len(normalized_phrase) < 2:
                    continue
                best_match = process.extractOne(
                    normalized_phrase,
                    self._alias_keys,
                    scorer=fuzz.WRatio,
                )
                if not best_match:
                    continue
                alias_key, score, _ = best_match
                if score < self._threshold:
                    continue
                film = self.resolver.film_for_alias(alias_key)
                original_start = tokens[start_idx][1]
                original_end = tokens[end_idx - 1][2]
                mention_text = text[original_start:original_end]
                new_mention = FilmMention(
                    film=film,
                    text=mention_text,
                    score=float(score),
                    start=original_start,
                    end=original_end,
                )
                span_key = (original_start, original_end)
                prev_mention = mentions.get(span_key)
                if prev_mention is None or prev_mention.score < new_mention.score:
                    mentions[span_key] = new_mention

        return sorted(mentions.values(), key=lambda item: (item.start, -item.score))

    def any_match(self, text: str) -> bool:
        """Быстрая проверка наличия упоминания фильма."""

        return bool(self.detect(text))
