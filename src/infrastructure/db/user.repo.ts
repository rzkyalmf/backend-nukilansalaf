import "reflect-metadata";

import { Prisma, type PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";

import { DBError, NotFoundError } from "../entity/error";
import type { CreateUser, IUser, UpdateUser } from "../entity/interface";
import { TYPES } from "../entity/types";

@injectable()
export class UserRepository implements IUser {
	constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

	async getAll() {
		try {
			const users = await this.prisma.user.findMany();

			return users;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async getOne(userIdOrEmail: string) {
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					OR: [
						{
							id: userIdOrEmail,
						},
						{
							email: userIdOrEmail,
						},
					],
				},
			});

			if (!user) {
				throw new NotFoundError("User not found");
			}

			return user;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			throw new DBError("Database error");
		}
	}

	async create(data: CreateUser) {
		try {
			const newUser = await this.prisma.user.create({
				data,
			});

			return newUser;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async update(userId: string, data: UpdateUser) {
		try {
			const updatedUser = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data,
			});

			return updatedUser;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async delete(userId: string) {
		try {
			await this.prisma.user.delete({
				where: {
					id: userId,
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
