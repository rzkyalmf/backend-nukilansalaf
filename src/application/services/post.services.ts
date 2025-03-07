import { inject, injectable } from "inversify";
import * as crypto from "node:crypto";
import "reflect-metadata";
import slugify from "slugify";
import { DBError, NotFoundError } from "../../infrastructure/entity/error";
import type {
	CreatePost,
	IPost,
	UpdatePost,
} from "../../infrastructure/entity/interface";
import { TYPES } from "../../infrastructure/entity/types";

@injectable()
export class PostServices {
	constructor(@inject(TYPES.postRepo) private postRepo: IPost) {}

	async getAll(userId: string) {
		try {
			const posts = await this.postRepo.getAll(userId);
			return posts;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async getOne(id: string) {
		try {
			const post = await this.postRepo.getOne(id);
			return post;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			throw error;
		}
	}

	async create(data: CreatePost) {
		try {
			const titleSlug = slugify(data.slug, { lower: true });
			const generateCode = crypto.randomInt(10000, 99999).toString();

			data.slug = `${generateCode}-${titleSlug}`;

			const newPost = await this.postRepo.create(data);

			return newPost;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async update(postId: string, data: UpdatePost) {
		try {
			const isPostExist = await this.postRepo.getOne(postId);

			if (data.title && data.title !== isPostExist.title) {
				const titleSlug = slugify(data.title, { lower: true });
				const generateCode = crypto.randomInt(10000, 99999).toString();
				data.slug = `${generateCode}-${titleSlug}`;
			}

			const updatedPost = await this.postRepo.update(postId, data);

			return updatedPost;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async delete(postId: string) {
		try {
			await this.postRepo.delete(postId);
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}
}
