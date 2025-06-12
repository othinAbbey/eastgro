// utils/cache.js

// Simple in-memory cache
const cache = new Map();

/**
 * Set a value in the cache with an optional expiration time (in ms)
 */
function setCache(key, value, ttl = 0) {
  const data = { value };
  if (ttl > 0) {
    data.expiry = Date.now() + ttl;
  }
  cache.set(key, data);
}

/**
 * Get a value from the cache, returns null if expired or not found
 */
function getCache(key) {
  const data = cache.get(key);
  if (!data) return null;

  if (data.expiry && Date.now() > data.expiry) {
    cache.delete(key); // expired
    return null;
  }

  return data.value;
}

/**
 * Clear a specific key
 */
function clearCache(key) {
  cache.delete(key);
}

/**
 * Clear the entire cache
 */
function clearAllCache() {
  cache.clear();
}

// Aliases for compatibility (optional)
function set(key, value, ttl = 0) {
  return setCache(key, value, ttl);
}

function get(key) {
  return getCache(key);
}

// Export everything as a default object
export default {
  setCache,
  getCache,
  clearCache,
  clearAllCache,
  set,
  get,
};
