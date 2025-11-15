"""Настройки и константы для ML-конвейера."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Optional


@dataclass(slots=True)
class EmbeddingConfig:
    """Параметры генерации эмбеддингов."""

    model_name: str = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    device: Optional[str] = None
    batch_size: int = 32
    normalize_embeddings: bool = True


@dataclass(slots=True)
class EntityExtractionConfig:
    """Настройки извлечения сущностей."""

    spacy_model: str = "ru_core_news_lg"
    include_types: Optional[Iterable[str]] = None


@dataclass(slots=True)
class TopicClusteringConfig:
    """Конфигурация тематического кластеризатора."""

    min_cluster_size: int = 5
    min_samples: Optional[int] = None
    n_components: int = 15
    n_neighbors: int = 15
    random_state: int = 42
    top_terms: int = 10


@dataclass(slots=True)
class FilmAliasConfig:
    """Конфигурация резолвера алиасов фильмов."""

    aliases_path: Path = Path("data/film-aliases.json")
    match_threshold: float = 85.0
    locale_priority: tuple[str, ...] = ("ru", "en")


@dataclass(slots=True)
class PipelineConfig:
    """Единый конфиг для комплексного анализа."""

    embedding: EmbeddingConfig = field(default_factory=EmbeddingConfig)
    entities: EntityExtractionConfig = field(default_factory=EntityExtractionConfig)
    topics: TopicClusteringConfig = field(default_factory=TopicClusteringConfig)
    aliases: FilmAliasConfig = field(default_factory=FilmAliasConfig)


DEFAULT_PIPELINE_CONFIG = PipelineConfig()
