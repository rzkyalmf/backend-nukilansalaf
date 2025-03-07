import cookie from "@elysiajs/cookie";
import cors from "@elysiajs/cors";

import { Elysia } from "elysia";

import swagger from "@elysiajs/swagger";
import { authRouter } from "./presentation/router/auth.router";
import { postRouter } from "./presentation/router/post.router";
import { quoteRouter } from "./presentation/router/quote.router";

const app = new Elysia()
	.onError(({ code, error, set }) => {
		console.log("Global error handler triggered:", code);

		set.headers = {
			"Content-Type": "application/json",
		};

		if (error instanceof Error) {
			set.status = 400;
			return {
				status: "error",
				message: error.message,
			};
		}

		set.status = 500;
		return {
			status: "error",
			message: "Internal server error",
		};
	})

	.use(cors())
	.use(cookie())
	.use(
		swagger({
			path: "/docs",
		}),
	)

	.group("/api", (app) => app.use(authRouter).use(quoteRouter).use(postRouter))
	.listen(8001);
