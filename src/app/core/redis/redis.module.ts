import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redise.service';
import { getRedisConfig } from '../configs/redis.config';

@Module({
  imports: [RedisModule.forRootAsync(getRedisConfig())],
  providers: [RedisService],
  exports: [RedisService],
})
export class UpRedisModule {}
