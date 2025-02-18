import Elysia from "elysia";
import { authServices } from "../../application/instance";
import { AutorizationError } from "../../infrastructure/entity/error";

export const authMiddleware = new Elysia().derive(async ({ headers }) => {
	const token = headers.authorization?.split(" ")[1];

	if (!token) {
		throw new AutorizationError("Token not provided");
	}

	const user = await authServices.verifyAccessToken(token);

	return { userId: user.id };
});
