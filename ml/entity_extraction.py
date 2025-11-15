"""Извлечение именованных сущностей."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

import spacy
from spacy.language import Language

from .config import EntityExtractionConfig


@dataclass(slots=True, frozen=True)
class Entity:
    text: str
    label: str
    start: int
    end: int


class EntityExtractor:
    """Обёртка над spaCy для извлечения сущностей."""

    def __init__(self, config: EntityExtractionConfig | None = None) -> None:
        self.config = config or EntityExtractionConfig()
        self._nlp: Language | None = None

    @property
    def nlp(self) -> Language:
        if self._nlp is None:
            self._nlp = spacy.load(self.config.spacy_model)
        return self._nlp

    def extract(self, text: str) -> list[Entity]:
        doc = self.nlp(text)
        allowed = set(self.config.include_types) if self.config.include_types else None
        entities: list[Entity] = []
        for ent in doc.ents:
            if allowed and ent.label_ not in allowed:
                continue
            entities.append(Entity(text=ent.text, label=ent.label_, start=ent.start_char, end=ent.end_char))
        return entities

    def extract_batch(self, texts: Sequence[str]) -> list[list[Entity]]:
        allowed = set(self.config.include_types) if self.config.include_types else None
        results: list[list[Entity]] = []
        for doc in self.nlp.pipe(texts):
            entities: list[Entity] = []
            for ent in doc.ents:
                if allowed and ent.label_ not in allowed:
                    continue
                entities.append(Entity(text=ent.text, label=ent.label_, start=ent.start_char, end=ent.end_char))
            results.append(entities)
        return results

    def iter_extract(self, texts: Iterable[str]) -> Iterable[list[Entity]]:
        allowed = set(self.config.include_types) if self.config.include_types else None
        for doc in self.nlp.pipe(texts):
            yield [
                Entity(text=ent.text, label=ent.label_, start=ent.start_char, end=ent.end_char)
                for ent in doc.ents
                if not allowed or ent.label_ in allowed
            ]
