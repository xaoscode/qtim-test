export interface IArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  createdAt: Date;
}

export interface ICreateArticle extends Omit<IArticle, 'id' | 'createdAt'> {
  title: string;
  description: string;
  content: string;
}
