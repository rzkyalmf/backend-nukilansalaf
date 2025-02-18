import cookie from "@elysiajs/cookie";
import cors from "@elysiajs/cors";

import { Elysia } from "elysia";

import swagger from "@elysiajs/swagger";
import { authRouter } from "./presentation/router/auth.router";

const app = new Elysia()
	.use(cors())
	.use(cookie())
	.use(
		swagger({
			path: "/docs",
		}),
	)
	.group("/api", (app) => app.use(authRouter))
	.listen(8001);
