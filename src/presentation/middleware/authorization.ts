import { authServices } from "@app/instance";
import { AuthorizationError } from "@infra/entity/error";
import Elysia from "elysia";

export const authMiddleware = new Elysia().derive(
	{ as: "global" },
	async ({ headers }) => {
		const token = headers.authorization?.split(" ")[1];

		if (!token) {
			throw new AuthorizationError("Token not provided");
		}

		const user = await authServices.verifyAccessToken(token);
		return { userId: user.id, Role: user.role };
	},
);
