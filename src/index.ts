import cookie from "@elysiajs/cookie";
import cors from "@elysiajs/cors";

import { Elysia } from "elysia";

import swagger from "@elysiajs/swagger";
import { authRouter } from "./presentation/router/auth.router";
import { quoteRouter } from "./presentation/router/quote.router";

const app = new Elysia()
	.use(cors())
	.use(cookie())
	.use(
		swagger({
			path: "/docs",
		}),
	)
	.group("/api", (app) => app.use(authRouter).use(quoteRouter))
	.listen(8001);
