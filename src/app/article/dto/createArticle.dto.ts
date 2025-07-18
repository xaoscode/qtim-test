import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ICreateArticle } from 'src/libs/interfaces/article.interface';

export class CreateArticleDto implements ICreateArticle {
  @ApiProperty({
    description: 'The title of the article.',
    type: String,
    minLength: 3,
    maxLength: 100,
    example: 'New Article Title',
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @ApiProperty({
    description: 'A brief description of the article.',
    type: String,
    minLength: 10,
    maxLength: 500,
    example: 'This is a description of the new article.',
  })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description: string;

  @ApiProperty({
    description: 'The main content of the article.',
    type: String,
    minLength: 20,
    maxLength: 10000,
    example: 'This is the content of the new article...',
  })
  @IsString({ message: 'Content must be a string' })
  @MinLength(20, { message: 'Content must be at least 20 characters long' })
  @MaxLength(10000, { message: 'Content cannot exceed 10000 characters' })
  content: string;
}
