"""Управление алиасами фильмов и нормализация упоминаний."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Mapping, Sequence

from rapidfuzz import fuzz, process

from .config import FilmAliasConfig
from .preprocessing import normalize_text


@dataclass(slots=True, frozen=True)
class FilmRecord:
    """Структура описания фильма в каталоге."""

    id: str
    title: str
    original_title: str | None
    year: int | None
    countries: str | None


@dataclass(slots=True, frozen=True)
class FilmAliasMatch:
    """Результат сопоставления пользовательского ввода с фильмом."""

    film: FilmRecord
    matched_alias: str
    score: float


class FilmAliasResolver:
    """Индексация и размытое сопоставление алиасов фильмов."""

    def __init__(self, config: FilmAliasConfig | None = None) -> None:
        self.config = config or FilmAliasConfig()
        self._alias_to_film: dict[str, FilmRecord] = {}
        self._alias_display: dict[str, str] = {}
        self._max_alias_tokens: int = 1

    def load(self, aliases_path: Path | None = None) -> None:
        """Загружает алиасы из JSON-файла и строит индекс."""

        path = aliases_path or self.config.aliases_path
        with path.open("r", encoding="utf-8") as fp:
            raw_data: Sequence[Mapping[str, object]] = json.load(fp)

        for entry in raw_data:
            film = FilmRecord(
                id=str(entry.get("id")),
                title=str(entry.get("title")),
                original_title=str(entry.get("originalTitle"))
                if entry.get("originalTitle")
                else None,
                year=int(entry.get("year")) if entry.get("year") else None,
                countries=str(entry.get("countries")) if entry.get("countries") else None,
            )
            aliases: set[str] = set()
            for value in (
                film.title,
                film.original_title,
                *(entry.get("aliases") or []),
            ):
                if not value:
                    continue
                aliases.add(value)

            for locale in self.config.locale_priority:
                localized_key = f"title_{locale}"
                value = entry.get(localized_key)
                if isinstance(value, str):
                    aliases.add(value)

            for alias in aliases:
                normalized = normalize_text(alias)
                if not normalized:
                    continue
                self._alias_to_film[normalized] = film
                self._alias_display[normalized] = alias
                token_length = len(normalized.split())
                if token_length > self._max_alias_tokens:
                    self._max_alias_tokens = token_length

    @property
    def aliases(self) -> Iterable[str]:
        return self._alias_to_film.keys()

    @property
    def max_alias_tokens(self) -> int:
        if not self._alias_to_film:
            self.load()
        return self._max_alias_tokens

    def film_for_alias(self, alias_key: str) -> FilmRecord:
        return self._alias_to_film[alias_key]

    def display_alias(self, alias_key: str) -> str:
        return self._alias_display[alias_key]

    def resolve(self, query: str, *, limit: int = 5) -> list[FilmAliasMatch]:
        """Возвращает список кандидатов, отсортированных по убыванию сходства."""

        if not self._alias_to_film:
            self.load()

        normalized_query = normalize_text(query)
        if not normalized_query:
            return []

        matches = process.extract(
            normalized_query,
            self._alias_to_film.keys(),
            scorer=fuzz.WRatio,
            limit=limit,
        )

        results: list[FilmAliasMatch] = []
        threshold = self.config.match_threshold
        for candidate, score, _ in matches:
            if score < threshold:
                continue
            film = self._alias_to_film[candidate]
            results.append(
                FilmAliasMatch(
                    film=film,
                    matched_alias=self._alias_display[candidate],
                    score=float(score),
                )
            )
        return results

    def has_match(self, query: str) -> bool:
        """Проверяет, есть ли среди кандидатов уверенное совпадение."""

        return bool(self.resolve(query, limit=1))
