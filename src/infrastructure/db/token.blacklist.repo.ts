import { Prisma, type PrismaClient } from "@prisma/client";

import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TYPES } from "../entity/types";

import { DBError, NotFoundError } from "../entity/error";
import type { ITokenBlacklist } from "../entity/interface";

@injectable()
export class TokenBlacklistRepository implements ITokenBlacklist {
	constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

	async isBlacklisted(token: string) {
		try {
			const blacklisted = await this.prisma.tokenBlacklist.findFirst({
				where: {
					token,
				},
			});

			if (blacklisted) {
				throw new NotFoundError("token is blacklisted");
			}

			return false;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			throw new DBError("Database error");
		}
	}

	async addToBlacklist(token: string) {
		try {
			await this.prisma.tokenBlacklist.create({
				data: {
					token,
					expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new NotFoundError("Token already blacklisted");
				}
			}
			throw new DBError("Database operation failed");
		}
	}
}
