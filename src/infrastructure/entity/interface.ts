import type { CodeOtp, Quote, User } from "@prisma/client";

export type CreateUser = Pick<
	User,
	"name" | "username" | "email" | "password" | "avatar"
>;
export type UpdateUser = Partial<User>;
export type CreateOTP = Omit<CodeOtp, "id" | "createdAt">;
export type UpdateOTP = Partial<CodeOtp>;
export type CreateQuote = Omit<Quote, "id" | "createdAt">;
export type UpdateQuote = Partial<Quote>;

export interface IUser {
	getAll: () => Promise<User[]>;
	getOne: (userIdOrEmail: string) => Promise<User>;
	create: (data: CreateUser) => Promise<User>;
	update: (id: string, data: UpdateUser) => Promise<User>;
	delete: (id: string) => Promise<void>;

	findByUsername: (username: string) => Promise<boolean>;
}

export interface ICodeOtp {
	getOne: (userIdorCode: string) => Promise<CodeOtp>;
	create: (data: CreateOTP) => Promise<CodeOtp>;
	update: (id: string, data: UpdateOTP) => Promise<CodeOtp>;
	delete: (id: string) => Promise<void>;
}

export interface ITokenBlacklist {
	isBlacklisted(token: string): Promise<boolean>;
	addToBlacklist(token: string): Promise<void>;
}

export interface IQuote {
	getAll: (userId: string) => Promise<Quote[]>;
	getOne: (id: string) => Promise<Quote>;
	create: (data: CreateQuote) => Promise<Quote>;
	update: (id: string, data: UpdateQuote) => Promise<Quote>;
	delete: (id: string) => Promise<void>;
}
