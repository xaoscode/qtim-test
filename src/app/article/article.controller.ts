import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FilterQueryParams } from './dto/filterQueryParams';
import { ArticleService } from './article.service';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import JwtAuthGuard from '../../libs/guards/jwt.guard';
import { User } from '../../libs/decorators/user.decorator';
import { IUser } from 'src/libs/interfaces/user.interface';
import { CreateArticleDto } from './dto/createArticle.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Articles')
@Controller('/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('/posts')
  @ApiOperation({
    summary:
      'Retrieve a list of articles with optional filtering and pagination',
  })
  @ApiOkResponse({ description: 'List of articles retrieved successfully' })
  async getArticles(@Query() queryParams: FilterQueryParams) {
    return this.articleService.getAllArticles(queryParams);
  }

  @Patch('/update/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing article by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the article to update',
  })
  @ApiBody({ type: UpdateArticleDto })
  @ApiOkResponse({
    description: 'The article has been successfully updated',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token required' })
  @ApiForbiddenResponse({ description: 'User is not an author' })
  @ApiNotFoundResponse({ description: 'No such article with this ID' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @User() user: IUser,
  ) {
    return this.articleService.updateArticle(id, dto, user.id);
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiOkResponse({ description: 'The article has been successfully created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token required' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async create(@Body() article: CreateArticleDto, @User() user: IUser) {
    return this.articleService.createArticle(article, user.id);
  }

  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an article by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the article to delete',
  })
  @ApiOkResponse({ description: 'The article has been successfully deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token required' })
  @ApiForbiddenResponse({ description: 'User is not an author' })
  @ApiNotFoundResponse({ description: 'No such article with this ID' })
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: IUser) {
    return this.articleService.deleteArticle(id, user.id);
  }

  @Get('/id/:id')
  @ApiOperation({ summary: 'Retrieve an article by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the article',
  })
  @ApiOkResponse({ description: 'The article has been successfully retrieved' })
  @ApiNotFoundResponse({ description: 'No such article with this ID' })
  @ApiBadRequestResponse({ description: 'Invalid article ID' })
  async getByTitle(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleById(id);
  }
}
