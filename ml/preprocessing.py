"""Инструменты предварительной обработки текста."""

from __future__ import annotations

import re
import unicodedata
from typing import Iterable

_NON_ALPHANUMERIC_RE = re.compile(r"[^\w\s]", flags=re.UNICODE)
_MULTISPACE_RE = re.compile(r"\s{2,}")


def strip_accents(text: str) -> str:
    """Удаляет диакритические знаки."""

    normalized = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")


def normalize_text(text: str, *, keep_case: bool = False) -> str:
    """Проводит лёгкую нормализацию текста.

    Операции:
    - NFC нормализация
    - обрезка пробелов
    - опциональное приведение к нижнему регистру
    - удаление повторяющихся пробелов
    - удаление спецсимволов (оставляем буквы/цифры/подчёркивание)
    """

    if not isinstance(text, str):  # fail-fast
        raise TypeError("Ожидается строка для нормализации")

    cleaned = unicodedata.normalize("NFC", text)
    if not keep_case:
        cleaned = cleaned.lower()
    cleaned = _NON_ALPHANUMERIC_RE.sub(" ", cleaned)
    cleaned = _MULTISPACE_RE.sub(" ", cleaned)
    return cleaned.strip()


def batched(iterable: Iterable[str], batch_size: int) -> list[list[str]]:
    """Разбивает последовательность строк на батчи фиксированного размера."""

    batch: list[str] = []
    result: list[list[str]] = []
    for item in iterable:
        batch.append(item)
        if len(batch) == batch_size:
            result.append(batch)
            batch = []
    if batch:
        result.append(batch)
    return result
