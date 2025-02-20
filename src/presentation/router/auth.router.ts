import Elysia, { t } from "elysia";
import { authServices } from "../../application/instance";
import { AutorizationError } from "../../infrastructure/entity/error";

export const authRouter = new Elysia({ prefix: "/v1" })
	.post(
		"/register",
		async ({ body, set }) => {
			try {
				const result = await authServices.registerUser(
					body.name,
					body.username,
					body.email,
					body.phone,
					body.password,
				);

				set.status = 201;
				return result;
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
				name: t.String({ minLength: 3 }),
				username: t.String({ minLength: 3 }),
				email: t.String({ format: "email" }),
				phone: t.String({ minLength: 8 }),
				password: t.String({ minLength: 8 }),
			}),
		},
	)

	.post(
		"/verify",
		async ({ body, set }) => {
			try {
				const result = await authServices.verifyRegistration(
					body.token,
					body.code,
				);
				set.status = 200;
				return result;
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
				token: t.String(),
				code: t.String(),
			}),
		},
	)

	.post(
		"/login",
		async ({ body, set, cookie: { token } }) => {
			try {
				const result = await authServices.loginUser(body.email, body.password);

				token.set({
					value: result.token,
					httpOnly: true,
					secure: true,
					path: "/",
					maxAge: 6 * 86400,
				});

				set.status = 200;
				return result.token;
			} catch (error) {
				set.status = 500;
				if (error instanceof Error) {
					throw new Error(error.message);
				}
				throw new Error("Something went wrong");
			}
		},
		{
			cookie: t.Cookie({
				token: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 8 }),
			}),
		},
	)

	.post(
		"/logout",
		async ({ cookie: { token }, headers, set }) => {
			try {
				const getToken = headers.authorization?.split(" ")[1];

				if (!getToken) {
					throw new AutorizationError("Token not provided");
				}

				set.status = 204;
				await authServices.logout(getToken);

				token.remove();
			} catch (error) {
				set.status = 500;
				if (error instanceof Error) {
					throw new Error(error.message);
				}
				throw new Error("Something went wrong");
			}
		},
		{
			cookie: t.Cookie({
				token: t.Optional(t.String()),
			}),
		},
	)

	.post(
		"/forgot-password",
		async ({ body, set }) => {
			try {
				const result = await authServices.forgotPassword(body.email);

				set.status = 200;
				return result;
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
				email: t.String({ format: "email" }),
			}),
		},
	)

	.post(
		"/verify-forgot-password",
		async ({ body, set }) => {
			try {
				const result = await authServices.verifyForgotPassword(
					body.token,
					body.code,
				);
				set.status = 200;
				return result;
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
				token: t.String(),
				code: t.String(),
			}),
		},
	)

	.post(
		"/reset-password",
		async ({ body, set }) => {
			try {
				const result = await authServices.resetPassword(
					body.token,
					body.password,
				);
				set.status = 200;
				return result;
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
				token: t.String(),
				password: t.String({ minLength: 8 }),
			}),
		},
	);
