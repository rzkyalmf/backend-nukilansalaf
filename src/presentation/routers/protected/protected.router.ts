import Elysia from "elysia";
import { advertisementsRouter } from "./advertisements/advertisements.router";
import { articlesRouter } from "./articles/articles.router";
import { sectionsRouter } from "./sections/sections.router";

export const protectedRouter = new Elysia({ prefix: "/v1" })
	.use(articlesRouter)
	.use(sectionsRouter)
	.use(advertisementsRouter);
