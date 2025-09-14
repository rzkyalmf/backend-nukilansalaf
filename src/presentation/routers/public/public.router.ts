import Elysia from "elysia";
import { articlesPublicRouter } from "./articles/articles.public.router";
import { sectionsPublicRouter } from "./sections/sections.public.router";
import { advertisementsPublicRouter } from "./advertisements/advertisements.public.router";

export const publicRouter = new Elysia({ prefix: "/v1/public" })
  .use(articlesPublicRouter)
  .use(sectionsPublicRouter)
  .use(advertisementsPublicRouter);
