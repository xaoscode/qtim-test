import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ArticleRepository } from './repositories/article.repository';
import { FilterQueryParams } from './dto/filterQueryParams';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ICreateArticle } from 'src/libs/interfaces/article.interface';
import { Cacheable } from '../../libs/decorators/cache.decorator';
import { RedisService } from '../core/redis/redise.service';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly redisService: RedisService,
  ) {}

  async createArticle(article: ICreateArticle, userId: number) {
    await this.validateUniqueTitle(article.title);
    return this.articleRepository.create(article, userId);
  }
  /**
   * Cacheable is a decorator that caches data for the current request
   * @param id - id of the article
   * You can also specify the caching time
   */
  @Cacheable((id: number) => `article:${id}`, 1000)
  async getArticleById(id: number) {
    const article = await this.articleRepository.getById(id);
    if (!article) {
      throw new BadRequestException(`Article with ID ${id} does not exist`);
    }
    return article;
  }

  @Cacheable(
    (params: FilterQueryParams) => `articles:${JSON.stringify(params)}`,
    1000,
  )
  async getAllArticles(params: FilterQueryParams) {
    return this.articleRepository.getAllWithFilters(params);
  }

  async updateArticle(id: number, article: UpdateArticleDto, userId: number) {
    const existingArticle = await this.validateAccess(id, userId);
    // function throws an error if the user is not the author of the article
    await this.validateUniqueTitle(article.title);

    Object.assign(existingArticle, article);
    await this.articleRepository.update(existingArticle);
    // invalidate article cache
    await this.invalidateCaches('article');
  }

  async deleteArticle(id: number, userId: number) {
    // function throws an error if the user is not the author of the article
    await this.validateAccess(id, userId);
    // delete article by id
    await this.articleRepository.deleteById(id);
    // invalidate article cache
    await this.invalidateCaches('article');
  }

  private async validateAccess(id: number, userId: number) {
    const article = await this.articleRepository.getArticleWithAuthor(id);
    if (!article) {
      throw new BadRequestException(`Article with ID ${id} does not exist`);
    }
    this.checkAccess(article.author.id, userId);
    return article;
  }

  private async validateUniqueTitle(title: string) {
    const existingArticle = await this.articleRepository.getByTitle(title);
    if (existingArticle) {
      throw new BadRequestException(
        `Article with title "${title}" already exists`,
      );
    }
  }

  private checkAccess(authorId: number, userId: number) {
    if (authorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to modify this article',
      );
    }
  }

  private async invalidateCaches(pattern: string): Promise<void> {
    try {
      const keys = await this.redisService.keys(`*${pattern}*`);
      if (keys.length) {
        await this.redisService.del(undefined, ...keys);
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate caches for pattern "${pattern}": ${error.message}`,
      );
    }
  }
}
