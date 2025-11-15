"""Генерация семантических эмбеддингов для постов."""

from __future__ import annotations

from typing import Iterable, Sequence

import numpy as np
from sentence_transformers import SentenceTransformer

from .config import EmbeddingConfig
from .preprocessing import batched, normalize_text


class EmbeddingGenerator:
    """Обёртка над SentenceTransformer с удобной конфигурацией."""

    def __init__(self, config: EmbeddingConfig | None = None) -> None:
        self.config = config or EmbeddingConfig()
        self._model: SentenceTransformer | None = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(
                self.config.model_name,
                device=self.config.device,
            )
        return self._model

    def embed(self, texts: Sequence[str]) -> np.ndarray:
        """Векторизует коллекцию текстов."""

        preprocessed = [normalize_text(text, keep_case=True) for text in texts]
        embeddings = self.model.encode(
            preprocessed,
            batch_size=self.config.batch_size,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=self.config.normalize_embeddings,
        )
        return embeddings

    def embed_iter(self, texts: Iterable[str]) -> np.ndarray:
        """Векторизует тексты из произвольного итератора."""

        batches = batched(list(texts), self.config.batch_size)
        if not batches:
            return np.empty((0, self.model.get_sentence_embedding_dimension()))
        embedded_batches = [self.embed(batch) for batch in batches]
        return np.vstack(embedded_batches)

    def embed_single(self, text: str) -> np.ndarray:
        """Удобный хелпер для одиночного текста."""

        return self.embed([text])[0]
