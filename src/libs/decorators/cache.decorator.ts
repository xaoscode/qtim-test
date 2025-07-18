import { RedisService } from 'src/app/core/redis/redise.service';

// Function to generate cache key dynamically
type CacheKeyGenerator = (...args: any[]) => string;

// Cacheable decorator with dynamic key support
export function Cacheable(
  keyGenerator: CacheKeyGenerator | string,
  ttl?: number,
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Ensure redisService is injected
      const redisService: RedisService = this.redisService;
      if (!redisService) {
        throw new Error('RedisService is not injected.');
      }

      // Generate cache key
      const cacheKey =
        typeof keyGenerator === 'string' ? keyGenerator : keyGenerator(...args);

      // Try to get cached data
      try {
        const cachedResult = await redisService.get(cacheKey); // No multi, so Promise<string | null>
        if (cachedResult) {
          if (typeof cachedResult === 'string') {
            return JSON.parse(cachedResult);
          } else {
            throw new Error('Cached result is not a string');
          }
        }
      } catch (error) {
        console.error(`Cache get error for key: ${cacheKey}:`, error);
      }

      // Call the original method on cache miss
      const result = await originalMethod.apply(this, args);

      // Cache the result (serialize to JSON)
      try {
        const multi = redisService.multi();
        await redisService.set(cacheKey, JSON.stringify(result), multi);
        if (ttl) {
          await redisService.expire(cacheKey, ttl, multi);
        }
        await redisService.exec(multi);
      } catch (error) {
        console.error(`Cache set error for key: ${cacheKey}:`, error);
      }

      return result;
    };

    return descriptor;
  };
}
