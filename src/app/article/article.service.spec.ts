import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { ArticleRepository } from './repositories/article.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FilterQueryParams } from './dto/filterQueryParams';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ICreateArticle } from 'src/libs/interfaces/article.interface';
import { RedisService } from '../core/redis/redise.service';
import { ArticleEntity } from './enitites/article.entity';
import { createMock } from '@golevelup/ts-jest';

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let redisService: jest.Mocked<RedisService>;

  const mockArticle = {
    id: 41,

    title: 'New fsdaff Title',
    description: 'This is a description of the new article.',
    content: 'This is the content of the new article...',
    author: {
      id: 1,
      displayName: 'John Doe',
      email: '0G0l2@example.com',
    },
  } as ArticleEntity;

  const mockCreateArticle: ICreateArticle = {
    title: 'New Article',
    content: 'New Content',
    description: 'fsdsfd',
  };

  const mockUpdateArticle: UpdateArticleDto = {
    title: 'Updated Article',
    content: 'Updated Content',
  };

  const mockFilterParams: FilterQueryParams = {
    offset: 1,
    limit: 10,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    authorId: 1,
  };

  const mockWrongId = {
    id: 41,

    title: 'New fsdaff Title',
    description: 'This is a description of the new article.',
    content: 'This is the content of the new article...',
    author: {
      id: 2,
      displayName: 'John Doe',
      email: '0G0l2@example.com',
    },
  } as ArticleEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: createMock<ArticleEntity>(),
        },
        {
          provide: RedisService,
          useValue: createMock<RedisService>(),
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get(ArticleRepository);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createArticle', () => {
    it('should create an article successfully', async () => {
      articleRepository.getByTitle.mockResolvedValue(null);
      articleRepository.create.mockResolvedValue(mockArticle);

      const result = await service.createArticle(mockCreateArticle, 1);

      expect(articleRepository.getByTitle).toHaveBeenCalledWith(
        mockCreateArticle.title,
      );
      expect(articleRepository.create).toHaveBeenCalledWith(
        mockCreateArticle,
        1,
      );
      expect(result).toEqual(mockArticle);
    });

    it('should throw BadRequestException if title already exists', async () => {
      articleRepository.getByTitle.mockResolvedValue(mockArticle);

      await expect(service.createArticle(mockCreateArticle, 1)).rejects.toThrow(
        new BadRequestException(
          `Article with title "${mockCreateArticle.title}" already exists`,
        ),
      );
      expect(articleRepository.getByTitle).toHaveBeenCalledWith(
        mockCreateArticle.title,
      );
      expect(articleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getArticleById', () => {
    it('should return an article by ID', async () => {
      articleRepository.getById.mockResolvedValue(mockArticle);

      const result = await service.getArticleById(1);

      expect(articleRepository.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockArticle);
    });

    it('should throw BadRequestException if article does not exist', async () => {
      articleRepository.getById.mockResolvedValue(null);

      await expect(service.getArticleById(1)).rejects.toThrow(
        new BadRequestException('Article with ID 1 does not exist'),
      );
      expect(articleRepository.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllArticles', () => {
    it('should return articles with filters', async () => {
      const mockArticle = {
        id: 41,

        title: 'New fsdaff Title',
        description: 'This is a description of the new article.',
        content: 'This is the content of the new article...',
        author: {
          id: 1,
          displayName: 'John Doe',
          email: '0G0l2@example.com',
        },
      } as ArticleEntity;

      const mockArticles = {
        items: [mockArticle],
        count: 1,
      };
      articleRepository.getAllWithFilters.mockResolvedValue(mockArticles);

      const result = await service.getAllArticles(mockFilterParams);

      expect(articleRepository.getAllWithFilters).toHaveBeenCalledWith(
        mockFilterParams,
      );
      expect(result).toEqual(mockArticles);
    });
  });

  describe('updateArticle', () => {
    it('should update an article successfully', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(mockArticle);
      articleRepository.getByTitle.mockResolvedValue(null);
      articleRepository.update.mockResolvedValue(undefined);
      redisService.keys.mockResolvedValue(['article:1']);
      redisService.del.mockResolvedValue(undefined);

      await service.updateArticle(1, mockUpdateArticle, 1);

      expect(articleRepository.getArticleWithAuthor).toHaveBeenCalledWith(1);
      expect(articleRepository.getByTitle).toHaveBeenCalledWith(
        mockUpdateArticle.title,
      );
      expect(articleRepository.update).toHaveBeenCalledWith({
        ...mockArticle,
        ...mockUpdateArticle,
      });
    });

    it('should throw BadRequestException if article does not exist', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(null);

      await expect(
        service.updateArticle(1, mockUpdateArticle, 1),
      ).rejects.toThrow(
        new BadRequestException('Article with ID 1 does not exist'),
      );
      expect(articleRepository.getByTitle).not.toHaveBeenCalled();
      expect(articleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(mockArticle);

      await expect(
        service.updateArticle(1, mockUpdateArticle, 2),
      ).rejects.toThrow(
        new ForbiddenException('You are not authorized to modify this article'),
      );
      expect(articleRepository.getByTitle).not.toHaveBeenCalled();
      expect(articleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if title already exists', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(mockArticle);
      articleRepository.getByTitle.mockResolvedValue({ ...mockArticle, id: 2 });

      await expect(
        service.updateArticle(1, mockUpdateArticle, 1),
      ).rejects.toThrow(
        new BadRequestException(
          `Article with title "${mockUpdateArticle.title}" already exists`,
        ),
      );
      expect(articleRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteArticle', () => {
    it('should delete an article successfully', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(mockArticle);
      articleRepository.deleteById.mockResolvedValue(undefined);
      redisService.keys.mockResolvedValue(['article:1']);
      redisService.del.mockResolvedValue(undefined);

      await service.deleteArticle(1, 1);

      expect(articleRepository.getArticleWithAuthor).toHaveBeenCalledWith(1);
      expect(articleRepository.deleteById).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if article does not exist', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(null);

      await expect(service.deleteArticle(1, 1)).rejects.toThrow(
        new BadRequestException('Article with ID 1 does not exist'),
      );
      expect(articleRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(mockWrongId);

      await expect(service.deleteArticle(1, 1)).rejects.toThrow(
        new ForbiddenException('You are not authorized to modify this article'),
      );
      expect(articleRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('validateArticleAndAccess', () => {
    it('should return article if it exists and user is authorized', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(mockArticle);

      const result = await service['validateArticleAndAccess'](1, 1);

      expect(articleRepository.getArticleWithAuthor).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockArticle);
    });

    it('should throw BadRequestException if article does not exist', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(null);

      await expect(service['validateArticleAndAccess'](1, 1)).rejects.toThrow(
        new BadRequestException('Article with ID 1 does not exist'),
      );
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      articleRepository.getArticleWithAuthor.mockResolvedValue(mockWrongId);

      await expect(service['validateArticleAndAccess'](1, 1)).rejects.toThrow(
        new ForbiddenException('You are not authorized to modify this article'),
      );
    });
  });

  describe('validateUniqueTitle', () => {
    it('should pass if title is unique', async () => {
      articleRepository.getByTitle.mockResolvedValue(null);

      await service['validateUniqueTitle']('Unique Title');

      expect(articleRepository.getByTitle).toHaveBeenCalledWith('Unique Title');
    });

    it('should throw BadRequestException if title already exists', async () => {
      articleRepository.getByTitle.mockResolvedValue(mockArticle);

      await expect(
        service['validateUniqueTitle']('Test Article'),
      ).rejects.toThrow(
        new BadRequestException(
          `Article with title "Test Article" already exists`,
        ),
      );
      expect(articleRepository.getByTitle).toHaveBeenCalledWith('Test Article');
    });
  });

  describe('checkAccess', () => {
    it('should pass if user is the author', () => {
      expect(() => service['checkAccess'](1, 1)).not.toThrow();
    });

    it('should throw ForbiddenException if user is not the author', () => {
      expect(() => service['checkAccess'](2, 1)).toThrow(
        new ForbiddenException('You are not authorized to modify this article'),
      );
    });
  });
});
