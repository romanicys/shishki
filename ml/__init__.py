"""Модульные компоненты интеллектуальной обработки контента.

Этот пакет объединяет инструменты для нормализации текста, извлечения сущностей,
поиска упоминаний фильмов, построения эмбеддингов и тематического
кластерирования. Интерфейсы спроектированы так, чтобы их можно было
использовать как по отдельности, так и в составе единого конвейера.
"""

from .aliases import FilmAliasResolver
from .embeddings import EmbeddingGenerator
from .entity_extraction import EntityExtractor
from .film_detection import FilmMention, FilmMentionDetector
from .pipeline import AnalysisPipeline, AnalysisResult, PostAnalysis
from .topic_detection import TopicClusterer, TopicClusteringResult

__all__ = [
    "FilmAliasResolver",
    "EmbeddingGenerator",
    "EntityExtractor",
    "FilmMention",
    "FilmMentionDetector",
    "AnalysisPipeline",
    "AnalysisResult",
    "PostAnalysis",
    "TopicClusterer",
    "TopicClusteringResult",
]
