import { DBError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { IArticle } from "@infra/entity/interfaces/article/article.interface";
import type {
	CreateArticle,
	UpdateArticle,
} from "@infra/entity/types/article/article.types";
import { NotFoundError } from "elysia";
import { inject, injectable } from "inversify";
import * as crypto from "node:crypto";
import "reflect-metadata";
import slugify from "slugify";

@injectable()
export class ArticleServices {
	constructor(@inject(TYPES.articleRepo) private articleRepo: IArticle) {}

	async getAll(userId: string) {
		try {
			const articles = await this.articleRepo.getAll(userId);
			return articles;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async getAllPublished() {
		try {
			const articles = await this.articleRepo.getAllPublished();
			return articles;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async getOne(id: string) {
		try {
			const article = await this.articleRepo.getOne(id);
			return article;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			throw error;
		}
	}

	async create(data: CreateArticle) {
		try {
			const options = {
				lower: true,
				remove: /[*+~.()'"!:@]/g,
				strict: true,
			};

			const titleSlug = slugify(data.slug, options);
			const generateCode = crypto.randomInt(10000, 99999).toString();

			data.slug = `${generateCode}-${titleSlug}`;

			const newData = await this.articleRepo.create(data);

			return newData;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async update(articleId: string, data: UpdateArticle) {
		try {
			const isArticleExist = await this.articleRepo.getOne(articleId);

			if (data.title && data.title !== isArticleExist.title) {
				const options = {
					lower: true,
					remove: /[*+~.()'"!:@]/g,
					strict: true,
				};
				const titleSlug = slugify(data.title, options);
				const generateCode = crypto.randomInt(10000, 99999).toString();
				data.slug = `${generateCode}-${titleSlug}`;
			}

			const updatedData = await this.articleRepo.update(articleId, data);

			return updatedData;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async delete(articleId: string) {
		try {
			await this.articleRepo.delete(articleId);
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}
}
