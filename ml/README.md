# ML-конвейер Shishki

Набор модулей для семантической обработки редакционных постов:

- нормализация и очистка текста (`preprocessing.py`)
- извлечение сущностей на базе spaCy (`entity_extraction.py`)
- резолвинг алиасов фильмов и детекция упоминаний (`aliases.py`, `film_detection.py`)
- генерация эмбеддингов Sentence Transformers (`embeddings.py`)
- тематическое кластерирование и извлечение ключевых слов (`topic_detection.py`)
- единый конвейер, объединяющий все шаги (`pipeline.py`)

## Установка зависимостей

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
python -m spacy download ru_core_news_lg
```

## Базовый пример

```python
from ml import AnalysisPipeline

texts = [
    "\"Ковбой Бибоп\" вновь возвращается на большие экраны.",
    "Новый сериал от авторов Тарковского исследует тему одиночества.",
]

pipeline = AnalysisPipeline()
result = pipeline.analyze(texts)

for post, topic_label in zip(result.posts, result.clustering.labels):
    print(topic_label, post.film_mentions, [e.text for e in post.entities])
```

## Рекомендованные модели

- **Sentence Transformers**: `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` — устойчив к многоязычному контенту.
- **spaCy**: `ru_core_news_lg` для русских текстов (при необходимости можно переключиться на `xx_sent_ud_sm` для мультиязычных данных).
- **Кластеризация**: связка UMAP + HDBSCAN хорошо отделяет тематические группы даже при неоднородном корпусе.

## Оценка качества

- Проверяйте `FilmMention.score`, чтобы отфильтровать ложные срабатывания (по умолчанию порог 85).
- Оценивайте `TopicClusteringResult.noise_ratio` — высокий показатель может указывать на то, что тексты слишком разнородны или стоит повысить `min_cluster_size`.
- Для сущностей полезно ограничить `EntityExtractionConfig.include_types`, чтобы снизить количество нерелевантных меток.
