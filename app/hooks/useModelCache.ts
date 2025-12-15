/**
 * useModelCache Hook
 *
 * Caches 3D model files (GLB/GLTF) using the browser's Cache API
 * for faster subsequent loads. Falls back to direct fetch if Cache API
 * is not available.
 *
 * @module useModelCache
 */

import { useEffect, useState } from "react";

const CACHE_NAME = "wore-it-models-v1";

/**
 * Fetches and caches a model file
 *
 * @param url - URL of the model file to cache
 * @returns Object with cached URL and loading state
 */
export function useModelCache(url: string) {
  const [cachedUrl, setCachedUrl] = useState<string>(url);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;

    const cacheModel = async () => {
      try {
        // Check if Cache API is available
        if (!("caches" in window)) {
          setIsLoading(false);
          return;
        }

        // Open the cache
        const cache = await caches.open(CACHE_NAME);

        // Check if model is already cached
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
          // Model is cached, create blob URL from cached response
          const blob = await cachedResponse.blob();
          objectUrl = URL.createObjectURL(blob);
          setCachedUrl(objectUrl);
        } else {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`);
          }

          // Clone the response before caching (response can only be read once)
          const responseClone = response.clone();

          // Cache the response
          await cache.put(url, responseClone);

          // Create blob URL from the fetched response
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setCachedUrl(objectUrl);
        }
      } catch (error) {
        setCachedUrl(url);
      } finally {
        setIsLoading(false);
      }
    };

    cacheModel();

    // Cleanup: Revoke object URL when component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return { cachedUrl, isLoading };
}

/**
 * Clears all cached models
 * Useful for debugging or when you want to force refresh models
 */
export async function clearModelCache() {
  try {
    if ("caches" in window) {
      const deleted = await caches.delete(CACHE_NAME);
      if (deleted) {
      }
    }
  } catch (error) {}
}

/**
 * Gets the size of cached models
 * Useful for monitoring cache usage
 */
export async function getCacheSize(): Promise<number> {
  try {
    if (!("caches" in window)) return 0;

    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    let totalSize = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error("Error getting cache size:", error);
    return 0;
  }
}
