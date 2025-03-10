import Elysia from "elysia";
import { authServices } from "../../application/instance";
import { AutorizationError } from "../../infrastructure/entity/error";

export const authMiddleware = new Elysia().derive(
	{ as: "global" },
	async ({ headers }) => {
		const token = headers.autorization?.split(" ")[1];

		if (!token) {
			throw new AutorizationError("Token not provided");
		}

		const user = await authServices.verifyAccessToken(token);
		return { userId: user.id };
	},
);
