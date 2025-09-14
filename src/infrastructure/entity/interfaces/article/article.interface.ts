import type {
  CreateArticle,
  UpdateArticle,
} from "@infra/entity/types/article/article.types";
import type { Article } from "@prisma/client";

export interface IArticle {
  getAll: (userId: string) => Promise<Article[]>;
  getAllPublished: () => Promise<Article[]>;
  getOne: (id: string) => Promise<Article>;
  create: (data: CreateArticle) => Promise<Article>;
  update: (id: string, data: UpdateArticle) => Promise<Article>;
  delete: (id: string) => Promise<void>;
}
