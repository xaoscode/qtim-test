import { IArticle } from './article.interface';

export interface IUser {
  id: number;
  email: string;
  displayName: string;
  password: string;
  createdAt: Date;
}

export interface IUserWithArrticles extends IUser {
  articles: IArticle[];
}
