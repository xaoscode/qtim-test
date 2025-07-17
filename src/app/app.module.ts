import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConfigModuleOptions } from './configs/config.options';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeormConfig } from './configs/typeorm.config';
import { CacheModule } from '@nestjs/cache-manager';
import { getRedisConfig } from './configs/redis.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { LoggerModule } from 'nestjs-pino';
import { getLoggerConfig } from './configs/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot(getConfigModuleOptions()),
    TypeOrmModule.forRootAsync(getTypeormConfig()),
    CacheModule.registerAsync(getRedisConfig()),
    LoggerModule.forRoot(getLoggerConfig()),
    AuthModule,
    UserModule,
    ArticleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
