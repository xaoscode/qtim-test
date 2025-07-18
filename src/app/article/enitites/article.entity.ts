import { IArticle } from 'src/libs/interfaces/article.interface';
import { UserEntity } from '../../user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class ArticleEntity implements IArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  content: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (userEntity: UserEntity) => userEntity.articles)
  author: UserEntity;
}
