import { articleServices } from "@app/instance";
import Elysia, { t } from "elysia";

export const articlesPublicRouter = new Elysia({ prefix: "/articles" })
	// Get all published articles (public access)
	.get("/", async ({ set }) => {
		const articles = await articleServices.getAllPublished();

		set.status = 200;
		return {
			status: "success",
			message: "Public articles retrieved successfully",
			data: articles,
		};
	})

	// Get specific article by ID (public access)
	.get(
		"/:id",
		async ({ params, set }) => {
			const { id } = params;
			const article = await articleServices.getOne(id);

			set.status = 200;
			return {
				status: "success",
				message: "Article retrieved successfully",
				data: article,
			};
		},
		{
			params: t.Object({
				id: t.String({
					minLength: 1,
					error: "Article ID is required",
				}),
			}),
		},
	);
