import "reflect-metadata";

import { Prisma, type PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";

import { TYPES } from "../../infrastructure/entity/types";
import { DBError, NotFoundError } from "../entity/error";
import type { CreatePost, UpdatePost } from "../entity/interface";

@injectable()
export class PostRepository {
	constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

	async getAll(userId: string) {
		try {
			const posts = await this.prisma.post.findMany({
				where: {
					userId,
				},
			});

			return posts;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async getOne(idOrUserId: string) {
		try {
			const post = await this.prisma.post.findFirst({
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

			if (!post) {
				throw new NotFoundError("Data not found");
			}

			return post;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			throw new DBError("Database error");
		}
	}

	async create(data: CreatePost) {
		try {
			const newPost = await this.prisma.post.create({
				data,
			});

			return newPost;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DBs");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async update(postId: string, data: UpdatePost) {
		try {
			const updatedPost = await this.prisma.post.update({
				where: {
					id: postId,
				},
				data,
			});

			return updatedPost;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async delete(postId: string) {
		try {
			await this.prisma.post.delete({
				where: {
					id: postId,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}
}
