"""Тематическое кластерирование и детекция тем."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Sequence

import numpy as np
import umap
from hdbscan import HDBSCAN
from sklearn.feature_extraction.text import TfidfVectorizer

from .config import TopicClusteringConfig
from .preprocessing import normalize_text


@dataclass(slots=True)
class TopicClusteringResult:
    labels: np.ndarray
    topics: Dict[int, list[str]]
    cluster_sizes: Dict[int, int]
    embeddings: np.ndarray
    reduced_embeddings: np.ndarray

    @property
    def noise_ratio(self) -> float:
        noise = np.sum(self.labels == -1)
        return float(noise / len(self.labels)) if len(self.labels) else 0.0


class TopicClusterer:
    """Строит кластеры на основе эмбеддингов и извлекает ключевые термины."""

    def __init__(self, config: TopicClusteringConfig | None = None) -> None:
        self.config = config or TopicClusteringConfig()
        self._vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
        )

    def cluster(
        self,
        texts: Sequence[str],
        embeddings: np.ndarray,
    ) -> TopicClusteringResult:
        reduced = self._reduce(embeddings)
        clusterer = HDBSCAN(
            min_cluster_size=self.config.min_cluster_size,
            min_samples=self.config.min_samples,
            metric="euclidean",
            cluster_selection_epsilon=0.0,
        )
        labels = clusterer.fit_predict(reduced)
        topics, sizes = self._extract_topics(texts, labels)
        return TopicClusteringResult(
            labels=labels,
            topics=topics,
            cluster_sizes=sizes,
            embeddings=embeddings,
            reduced_embeddings=reduced,
        )

    def _reduce(self, embeddings: np.ndarray) -> np.ndarray:
        reducer = umap.UMAP(
            n_components=self.config.n_components,
            n_neighbors=self.config.n_neighbors,
            random_state=self.config.random_state,
            metric="cosine",
        )
        return reducer.fit_transform(embeddings)

    def _extract_topics(self, texts: Sequence[str], labels: np.ndarray) -> tuple[dict[int, list[str]], dict[int, int]]:
        normalized_texts = [normalize_text(text, keep_case=True) for text in texts]
        tfidf = self._vectorizer.fit_transform(normalized_texts)
        feature_names = np.array(self._vectorizer.get_feature_names_out())
        topics: dict[int, list[str]] = {}
        sizes: dict[int, int] = {}

        for label in sorted(set(labels)):
            if label == -1:
                continue
            cluster_indices = np.where(labels == label)[0]
            if cluster_indices.size == 0:
                continue
            cluster_matrix = tfidf[cluster_indices]
            mean_tfidf = np.asarray(cluster_matrix.mean(axis=0)).ravel()
            if not np.any(mean_tfidf):
                continue
            top_indices = mean_tfidf.argsort()[::-1][: self.config.top_terms]
            keywords = [feature_names[idx] for idx in top_indices if mean_tfidf[idx] > 0]
            topics[label] = keywords
            sizes[label] = int(cluster_indices.size)

        return topics, sizes

    def summarize(self, result: TopicClusteringResult, *, min_size: int = 3) -> dict[int, dict[str, object]]:
        summary: dict[int, dict[str, object]] = {}
        for label, keywords in result.topics.items():
            size = result.cluster_sizes.get(label, 0)
            if size < min_size:
                continue
            summary[label] = {
                "keywords": keywords,
                "size": size,
            }
        return summary
