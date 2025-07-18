import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConfigModuleOptions } from './core/configs/config.options';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeormConfig } from './core/configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { LoggerModule } from 'nestjs-pino';
import { getLoggerConfig } from './core/configs/logger.config';
import { UpRedisModule } from './core/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(getConfigModuleOptions()),
    TypeOrmModule.forRootAsync(getTypeormConfig()),
    LoggerModule.forRoot(getLoggerConfig()),
    AuthModule,
    UserModule,
    ArticleModule,
    UpRedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
