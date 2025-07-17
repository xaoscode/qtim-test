import { ArticleEntity } from '../../article/enitites/article.entity';
import { IUser } from 'src/libs/interfaces/user.interface';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  Relation,
} from 'typeorm';

@Entity()
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'display_name', unique: true })
  displayName: string;

  @Column({ name: 'password_hash' })
  password: string;

  @OneToMany(() => ArticleEntity, (articleEntity) => articleEntity.author)
  articles: Relation<ArticleEntity[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
