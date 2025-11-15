import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const assetBaseUrl = process.env.ASSET_BASE_URL?.replace(/\/$/, "");
const remotePatterns: RemotePattern[] = [
  {
    protocol: "http",
    hostname: "localhost",
    port: "3000",
    pathname: "/images/**",
  },
];

if (assetBaseUrl) {
  try {
    const parsed = new URL(assetBaseUrl);
    const basePath = parsed.pathname.replace(/\/$/, "");
    const normalizedBase = basePath || "";
    const hasImageSegment = normalizedBase.endsWith("/images");
    const pathname = hasImageSegment
      ? `${normalizedBase}/**`
      : `${normalizedBase ? `${normalizedBase}/` : "/"}images/**`;
    const protocol = parsed.protocol === "https:" ? "https" : "http";
    const port = parsed.port || undefined;
    remotePatterns.push({
      protocol,
      hostname: parsed.hostname,
      port,
      pathname,
    });
  } catch {
    // Silent fallback; invalid URL will simply skip the remote pattern.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
