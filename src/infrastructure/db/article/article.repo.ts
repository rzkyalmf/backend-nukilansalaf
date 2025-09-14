import "reflect-metadata";

import { DBError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { IArticle } from "@infra/entity/interfaces/article/article.interface";
import type {
  CreateArticle,
  UpdateArticle,
} from "@infra/entity/types/article/article.types";
import { Prisma, type PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { inject, injectable } from "inversify";

@injectable()
export class ArticleRepository implements IArticle {
  constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

  async getAll(userId: string) {
    try {
      const articles = await this.prisma.article.findMany({
        where: {
          userId,
        },
      });

      return articles;
    } catch (error) {
      console.error(`${this.constructor.name}.getAll failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve article from database");
      }

      throw new DBError("Unexpected error occurred while retrieving article");
    }
  }

  async getAllPublished() {
    try {
      const articles = await this.prisma.article.findMany({
        where: {
          published: true,
        },
      });

      return articles;
    } catch (error) {
      console.error(`${this.constructor.name}.getAllPublished failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve article from database");
      }

      throw new DBError("Unexpected error occurred while retrieving article");
    }
  }

  async getOne(idOrUserId: string) {
    try {
      const article = await this.prisma.article.findFirst({
        where: {
          OR: [
            {
              id: idOrUserId,
            },
            {
              userId: idOrUserId,
            },
          ],
        },
      });

      if (!article) {
        throw new NotFoundError("Data not found");
      }

      return article;
    } catch (error) {
      console.error(`${this.constructor.name}.getOne failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve article from database");
      }

      throw new DBError("Unexpected error occurred while retrieving article");
    }
  }

  async create(data: CreateArticle) {
    try {
      const newArticle = await this.prisma.article.create({
        data,
      });

      return newArticle;
    } catch (error) {
      console.error(`${this.constructor.name}.create failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to create article in database");
      }

      throw new DBError("Unexpected error occurred while creating article");
    }
  }

  async update(articleId: string, data: UpdateArticle) {
    try {
      const updatedArticle = await this.prisma.article.update({
        where: {
          id: articleId,
        },
        data,
      });

      return updatedArticle;
    } catch (error) {
      console.error(`${this.constructor.name}.update failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to update article in database");
      }

      throw new DBError("Unexpected error occurred while updating article");
    }
  }

  async delete(articleId: string) {
    try {
      await this.prisma.article.delete({
        where: {
          id: articleId,
        },
      });
    } catch (error) {
      console.error(`${this.constructor.name}.delete failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to delete article in database");
      }

      throw new DBError("Unexpected error occurred while deleting article");
    }
  }
}
