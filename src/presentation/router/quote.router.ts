import Elysia, { t } from "elysia";
import { quoteServices } from "../../application/instance";
import { authMiddleware } from "../middleware/autorization";

export const quoteRouter = new Elysia({ prefix: "/v1/quotes" })
	.use(authMiddleware)

	// Routes get one quotes (/api/v1/quotes/)
	.get("/", async ({ userId, set }) => {
		try {
			const quotes = await quoteServices.getAll(userId);
			set.status = 200;
			return quotes;
		} catch (error) {
			set.status = 500;

			if (error instanceof Error) {
				throw new Error(error.message);
			}
			throw new Error("Something went wrong");
		}
	})

	// Routes get one quotes (/api/v1/quotes/:id)
	.get("/:id", async ({ params, set }) => {
		try {
			const quote = await quoteServices.getOne(params.id);
			set.status = 200;
			return quote;
		} catch (error) {
			set.status = 500;

			if (error instanceof Error) {
				throw new Error(error.message);
			}
			throw new Error("Something went wrong");
		}
	})

	// Routes create quotes (/api/v1/quotes)
	.post(
		"/",
		async ({ body, userId, set }) => {
			try {
				const { title, speaker, content, source, description } = body;
				const newQuote = await quoteServices.create({
					userId,
					title,
					speaker,
					content,
					source,
					description,
				});

				set.status = 201;
				return newQuote;
			} catch (error) {
				set.status = 500;

				if (error instanceof Error) {
					throw new Error(error.message);
				}
				throw new Error("Something went wrong");
			}
		},
		{
			body: t.Object({
				title: t.String(),
				speaker: t.String(),
				content: t.String(),
				source: t.String(),
				description: t.String(),
			}),
		},
	)

	// Routes update quotes (/api/v1/quotes/:id)
	.patch(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const { title, speaker, content, source, description } = body;
				const updatedQuote = await quoteServices.update(params.id, {
					title,
					speaker,
					content,
					source,
					description,
				});

				set.status = 200;
				return updatedQuote;
			} catch (error) {
				set.status = 500;

				if (error instanceof Error) {
					throw new Error(error.message);
				}
				throw new Error("Something went wrong");
			}
		},
		{
			body: t.Object({
				title: t.String(),
				speaker: t.String(),
				content: t.String(),
				source: t.String(),
				description: t.String(),
			}),
		},
	)

	// Routes delete quotes (/api/v1/quotes/:id)
	.delete("/:id", async ({ params, set }) => {
		try {
			set.status = 204;
			await quoteServices.delete(params.id);
		} catch (error) {
			set.status = 500;
			if (error instanceof Error) {
				throw new Error(error.message);
			}
			throw new Error("Something went wrong");
		}
	});
