import { inject, injectable } from "inversify";
import "reflect-metadata";
import { DBError, NotFoundError } from "../../infrastructure/entity/error";
import type {
	CreateQuote,
	IQuote,
	UpdateQuote,
} from "../../infrastructure/entity/interface";
import { TYPES } from "../../infrastructure/entity/types";

@injectable()
export class QuoteServices {
	constructor(@inject(TYPES.quoteRepo) private quoteRepo: IQuote) {}

	async getAll(userId: string) {
		try {
			const quotes = await this.quoteRepo.getAll(userId);
			return quotes;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async getOne(id: string) {
		try {
			const quote = await this.quoteRepo.getOne(id);
			return quote;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
			throw error;
		}
	}

	async create(data: CreateQuote) {
		try {
			const newQuote = await this.quoteRepo.create(data);
			return newQuote;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async update(quoteId: string, data: UpdateQuote) {
		try {
			const updatedQuote = await this.quoteRepo.update(quoteId, data);
			return updatedQuote;
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}

	async delete(quoteId: string) {
		try {
			await this.quoteRepo.delete(quoteId);
		} catch (error) {
			if (error instanceof DBError) {
				throw error;
			}
			throw error;
		}
	}
}
