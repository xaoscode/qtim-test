import { RedisModuleAsyncOptions } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
export const getRedisConfig = (): RedisModuleAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'single',
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  }),
});
