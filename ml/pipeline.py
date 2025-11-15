"""Комплексный конвейер анализа контента."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

import numpy as np

from .aliases import FilmAliasResolver
from .config import PipelineConfig
from .embeddings import EmbeddingGenerator
from .entity_extraction import Entity, EntityExtractor
from .film_detection import FilmMention, FilmMentionDetector
from .topic_detection import TopicClusterer, TopicClusteringResult


@dataclass(slots=True)
class PostAnalysis:
    text: str
    entities: list[Entity]
    film_mentions: list[FilmMention]
    embedding: np.ndarray


@dataclass(slots=True)
class AnalysisResult:
    posts: list[PostAnalysis]
    clustering: TopicClusteringResult | None

    def find_posts_by_topic(self, label: int) -> list[PostAnalysis]:
        if not self.clustering:
            return []
        indices = np.where(self.clustering.labels == label)[0]
        return [self.posts[idx] for idx in indices]


class AnalysisPipeline:
    """Оркеструет извлечение сущностей, фильмов, эмбеддинги и тематики."""

    def __init__(self, config: PipelineConfig | None = None) -> None:
        self.config = config or PipelineConfig()
        self.alias_resolver = FilmAliasResolver(self.config.aliases)
        self.entity_extractor = EntityExtractor(self.config.entities)
        self.embedder = EmbeddingGenerator(self.config.embedding)
        self.topic_clusterer = TopicClusterer(self.config.topics)
        self.film_detector = FilmMentionDetector(self.alias_resolver)

    def analyze(self, texts: Sequence[str], *, cluster: bool = True) -> AnalysisResult:
        entities_per_post = self.entity_extractor.extract_batch(texts)
        film_mentions_per_post = [self.film_detector.detect(text) for text in texts]
        embeddings = self.embedder.embed(texts)
        posts = [
            PostAnalysis(
                text=text,
                entities=entities,
                film_mentions=mentions,
                embedding=embeddings[idx],
            )
            for idx, (text, entities, mentions) in enumerate(
                zip(texts, entities_per_post, film_mentions_per_post)
            )
        ]
        clustering = (
            self.topic_clusterer.cluster(texts, embeddings) if cluster and len(texts) > 1 else None
        )
        return AnalysisResult(posts=posts, clustering=clustering)
