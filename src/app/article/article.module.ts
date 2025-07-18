import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './enitites/article.entity';
import { ArticleController } from './article.controller';
import { ArticleRepository } from './repositories/article.repository';
import { ArticleService } from './article.service';
import { UpRedisModule } from '../core/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), UpRedisModule],
  controllers: [ArticleController],
  providers: [ArticleRepository, ArticleService],
})
export class ArticleModule {}
