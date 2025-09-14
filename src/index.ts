import cookie from "@elysiajs/cookie";
import cors from "@elysiajs/cors";

import { Elysia } from "elysia";

import swagger from "@elysiajs/swagger";
import { authRouter } from "./presentation/routers/auth/auth.router";
import { protectedRouter } from "./presentation/routers/protected/protected.router";
import { publicRouter } from "./presentation/routers/public/public.router";

const app = new Elysia()
	.onError(({ code, error, set }) => {
		console.log(
			JSON.stringify(
				{
					event: "Global error handler triggered",
					code: code,
					message: error instanceof Error ? error.message : "Unknown error",
					timestamp: new Date().toLocaleString("id-ID", {
						timeZone: "Asia/Jakarta",
					}),
					status:
						error && typeof error === "object" && "status" in error
							? error.status
							: null,
				},
				null,
				2,
			),
		);

		set.headers = {
			"Content-Type": "application/json",
		};

		if (error instanceof Error) {
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

	.group("/api", (app) =>
		app.use(authRouter).use(publicRouter).use(protectedRouter),
	)
	.listen(8010);

console.log("🚀 Server is running on port 8000");
console.log("📍 Local: http://localhost:8010");
console.log("📖 API Docs: http://localhost:8010/docs");
