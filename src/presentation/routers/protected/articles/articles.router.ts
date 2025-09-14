import { articleServices } from "@app/instance";
import { authMiddleware } from "@present/middleware/authorization";
import { CategoryType } from "@prisma/client";
import Elysia, { t } from "elysia";

export const articlesRouter = new Elysia({ prefix: "/articles" })
	.use(authMiddleware)

	// Routes get all articles (/api/v1/articles/)
	.get("/", async ({ userId, set }) => {
		const articles = await articleServices.getAll(userId);
		set.status = 200;
		return {
			status: "success",
			message: "Success get all articles",
			data: articles,
		};
	})

	// Routes get one articles (/api/v1/articles/:id)
	.get("/:id", async ({ params, set }) => {
		const { id } = params;
		const article = await articleServices.getOne(id);

		set.status = 200;
		return {
			status: "success",
			message: "Success get article",
			data: article,
		};
	})

	// Routes create articles (/api/v1/articles)
	.post(
		"/",
		async ({ body, userId, Role, set }) => {
			// Only ADMIN or CONTRIBUTOR can create articles
			if (!["ADMIN", "CONTRIBUTOR"].includes(Role)) {
				set.status = 403;
				return {
					status: "error",
					message: "Forbidden: Insufficient permissions to create articles",
				};
			}

			const { title, content, category, published } = body;

			const newData = await articleServices.create({
				userId,
				title,
				category,
				slug: title,
				content,
				published,
			});

			set.status = 201;
			return {
				status: "success",
				message: "Success create article",
				data: newData,
			};
		},
		{
			body: t.Object({
				title: t.String({
					minLength: 3,
					maxLength: 100,
					error: "Judul hanya bisa memiliki 3-100 karakter",
				}),
				category: t.Enum(CategoryType),
				content: t.String({
					minLength: 10,
					error: "Konten harus memiliki minimal 10 karakter",
				}),
				published: t.Boolean(),
			}),
		},
	)

	// Routes update articles (/api/v1/articles/:id)
	.patch(
		"/:id",
		async ({ params, body, userId, Role, set }) => {
			// Check if article exists and get article data
			const article = await articleServices.getOne(params.id);

			// Only ADMIN or article owner can update
			if (Role !== "ADMIN" && article.userId !== userId) {
				set.status = 403;
				return {
					status: "error",
					message:
						"Forbidden: You can only update your own articles or need admin privileges",
				};
			}

			const { title, content } = body;
			const updatedData = await articleServices.update(params.id, {
				title,
				content,
			});

			set.status = 200;
			return {
				status: "success",
				message: "Success update article",
				data: updatedData,
			};
		},
		{
			body: t.Object({
				title: t.Optional(
					t.String({
						minLength: 3,
						maxLength: 100,
						error: "Judul hanya bisa memiliki 3-100 karakter",
					}),
				),
				content: t.Optional(
					t.String({
						minLength: 10,
						error: "Konten harus memiliki minimal 10 karakter",
					}),
				),
			}),
		},
	)

	// Routes delete articles (/api/v1/articles/:id)
	.delete("/:id", async ({ params, userId, Role, set }) => {
		// Check if article exists and get article data
		const article = await articleServices.getOne(params.id);

		// Only ADMIN or article owner can delete
		if (Role !== "ADMIN" && article.userId !== userId) {
			set.status = 403;
			return {
				status: "error",
				message:
					"Forbidden: You can only delete your own articles or need admin privileges",
			};
		}

		set.status = 204;
		await articleServices.delete(params.id);
	});
