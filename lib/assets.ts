const assetBaseUrl = (process.env.ASSET_BASE_URL ?? "").replace(/\/$/, "");

function isLocalUrl(value: string) {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function getAssetUrl(fileName?: string | null) {
  if (!fileName) {
    return undefined;
  }
  if (assetBaseUrl && !isLocalUrl(assetBaseUrl)) {
    return `${assetBaseUrl}/${fileName}`;
  }
  return `/${fileName}`;
}
