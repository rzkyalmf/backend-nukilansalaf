import "reflect-metadata";

import { Prisma, type PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";

import { TYPES } from "../../infrastructure/entity/types";
import { DBError, NotFoundError } from "../entity/error";
import type { CreateQuote, UpdateQuote } from "../entity/interface";

@injectable()
export class QuoteRepository {
	constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

	async getAll(userId: string) {
		try {
			const quotes = await this.prisma.quote.findMany({
				where: {
					userId,
				},
			});

			return quotes;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async getOne(idOrUserId: string) {
		try {
			const quote = await this.prisma.quote.findFirst({
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

			if (!quote) {
				throw new NotFoundError("Data not found");
			}

			return quote;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			throw new DBError("Database error");
		}
	}

	async create(data: CreateQuote) {
		try {
			const newQuote = await this.prisma.quote.create({
				data,
			});

			return newQuote;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DBs");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async update(quoteId: string, data: UpdateQuote) {
		try {
			const updatedQuote = await this.prisma.quote.update({
				where: {
					id: quoteId,
				},
				data,
			});

			return updatedQuote;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new DBError("Error getting resources from DB");
			}

			throw new DBError("something went wrong while doing DB Operation");
		}
	}

	async delete(quoteId: string) {
		try {
			await this.prisma.quote.delete({
				where: {
					id: quoteId,
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
