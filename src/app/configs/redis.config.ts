import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
export const getRedisConfig = (): CacheModuleAsyncOptions => ({
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const redisStore = createKeyv(getRedisString(configService));
    return {
      stores: [redisStore],
      ttl: configService.get('REDIS_TTL'),
    };
  },
});

const getRedisString = (configService: ConfigService): string =>
  'redis://' +
  configService.get('REDIS_HOST') +
  ':' +
  configService.get('REDIS_PORT');
