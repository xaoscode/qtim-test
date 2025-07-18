import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ChainableCommander, Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  public multi(): ChainableCommander {
    return this.redis.multi();
  }

  public hSet(
    key: string,
    field: string,
    value: string,
    multi?: ChainableCommander,
  ): ChainableCommander | Promise<number> {
    const client = multi || this.redis;

    return client.hset(key, field, value);
  }

  public keys(key: string): Promise<string[]> {
    return this.redis.keys(key);
  }

  public expire(
    key: string,
    time: number,
    multi?: ChainableCommander,
  ): ChainableCommander | Promise<number> {
    const client = multi || this.redis;

    return client.expire(key, time);
  }

  public set(
    key: string,
    value: string,
    multi?: ChainableCommander,
  ): ChainableCommander | Promise<'OK'> {
    const client = multi || this.redis;

    return client.set(key, value);
  }

  public get(
    key: string,
    multi?: ChainableCommander,
  ): ChainableCommander | Promise<string | null> {
    const client = multi || this.redis;

    return client.get(key);
  }

  public del(
    multi?: ChainableCommander,
    ...keys: string[]
  ): ChainableCommander | Promise<number> {
    const client = multi || this.redis;

    return client.del(keys);
  }

  public async exec(multi: ChainableCommander): Promise<void> {
    const client = multi || this.redis;
    await client.exec();
  }
}
