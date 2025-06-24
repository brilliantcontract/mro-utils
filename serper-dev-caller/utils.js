export function parseQueries(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

export function createCachedFetcher(fetcher) {
  const cache = new Map();
  return async function(query) {
    if (cache.has(query)) {
      return cache.get(query);
    }
    const result = await fetcher(query);
    cache.set(query, result);
    return result;
  };
}
