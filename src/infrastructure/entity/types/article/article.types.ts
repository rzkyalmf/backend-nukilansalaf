import type { Article } from "@prisma/client";

export type CreateArticle = Pick<
	Article,
	"title" | "slug" | "category" | "content" | "published" | "userId"
>;
export type UpdateArticle = Partial<Article>;
