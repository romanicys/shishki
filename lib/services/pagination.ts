const DEFAULT_MIN_VALUE = 1;

function sanitizeNumber(value: number | undefined, fallback: number, minValue: number = DEFAULT_MIN_VALUE) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const normalized = Math.trunc(value);
  if (normalized < minValue) {
    return fallback;
  }

  return normalized;
}

export function resolvePage(value: number | undefined): number {
  return sanitizeNumber(value, 1);
}

export function resolvePageSize(
  value: number | undefined,
  defaultSize: number,
  maxSize: number = defaultSize,
): number {
  const sanitized = sanitizeNumber(value, defaultSize);
  const normalizedMax = Math.max(DEFAULT_MIN_VALUE, sanitizeNumber(maxSize, maxSize));
  return Math.min(normalizedMax, sanitized);
}
