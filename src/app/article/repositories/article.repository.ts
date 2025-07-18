import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../enitites/article.entity';
import { CreateArticleDto } from '../dto/createArticle.dto';
import { IArticle } from 'src/libs/interfaces/article.interface';
import { FilterQueryParams } from '../dto/filterQueryParams';

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async create(article: CreateArticleDto, userId: number) {
    const newArticle = this.articleRepository.create({
      ...article,
      author: { id: userId },
    });
    return this.articleRepository.save(newArticle);
  }

  async getAllWithFilters(queryParams: FilterQueryParams) {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .innerJoin('article.author', 'author')
      .select([
        'article.id',
        'article.title',
        'article.description',
        'article.content',
        'author.id',
        'author.displayName',
        'author.email',
      ])
      .orderBy('article.id', 'ASC')
      .skip(queryParams.offset)
      .take(queryParams.limit);

    if (queryParams.startDate) {
      queryBuilder.andWhere('article.createdAt >= :startDate', {
        startDate: new Date(queryParams.startDate),
      });
    }
    if (queryParams.endDate) {
      queryBuilder.andWhere('article.createdAt <= :endDate', {
        endDate: new Date(queryParams.endDate),
      });
    }
    if (queryParams.authorId) {
      queryBuilder.andWhere('author.id = :authorId', {
        authorId: queryParams.authorId,
      });
    }

    const [items, count] = await queryBuilder.getManyAndCount();

    return {
      items,
      count,
    };
  }
  async getArticleWithAuthor(id: number) {
    return await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async getById(id: number) {
    return await this.articleRepository.findOneBy({ id });
  }

  async update(article: IArticle): Promise<void> {
    await this.articleRepository.save(article);
  }

  async deleteById(id: number): Promise<void> {
    await this.articleRepository.delete({ id });
  }

  async getByTitle(title: string) {
    return await this.articleRepository.findOneBy({ title });
  }
}
