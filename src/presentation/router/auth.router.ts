import Elysia, { t } from "elysia";
import { authServices } from "../../application/instance";
import { AutorizationError } from "../../infrastructure/entity/error";

export const authRouter = new Elysia({ prefix: "/v1" })
	.post(
		"/register",
		async ({ body, set }) => {
			const result = await authServices.registerUser(
				body.name,
				body.username,
				body.email,
				body.password,
			);

			set.status = 201;
			return {
				status: "success",
				message: "Registration Success",
				data: {
					token: result,
				},
			};
		},
		{
			body: t.Object({
				name: t.String({
					minLength: 3,
					maxLength: 18,
					error: "Nama harus memiliki minimal 3-18 karakter",
				}),
				username: t.String({
					minLength: 3,
					maxLength: 8,
					pattern: "^[a-zA-Z0-9_\\.]+$",
					error: "Username: 3-20 karakter (huruf, angka, _, .)",
				}),
				email: t.String({ format: "email", error: "Format email tidak valid" }),
				password: t.String({
					minLength: 8,
					error: "Password harus memiliki minimal 6 karakter",
				}),
			}),
		},
	)

	.post(
		"/verify",
		async ({ body, set }) => {
			await authServices.verifyRegistration(body.token, body.code);
			set.status = 200;
			return {
				status: "success",
				message: "Verification Success",
			};
		},
		{
			body: t.Object({
				token: t.String({
					minLength: 1,
					error: "Verification Error",
				}),
				code: t.String({
					minLength: 6,
					error: "Kode harus memiliki 6 karakter",
				}),
			}),
		},
	)

	.post(
		"/login",
		async ({ body, set }) => {
			const result = await authServices.loginUser(body.email, body.password);

			set.status = 200;
			return {
				status: "success",
				message: "Login Success",
				data: {
					token: result.token,
				},
			};
		},
		{
			body: t.Object({
				email: t.String({ format: "email", error: "Format email tidak valid" }),
				password: t.String({
					minLength: 1,
					error: "Password tidak boleh kosong",
				}),
			}),
		},
	)

	.get("/me", async ({ headers, set }) => {
		const token = headers.authorization?.split(" ")[1];

		if (!token) {
			throw new AutorizationError("Token not provided");
		}

		const user = await authServices.verifyAccessToken(token);

		set.status = 200;
		return {
			status: "success",
			message: "Token Valid",
			data: {
				id: user.id,
				role: user.role,
			},
		};
	})

	.post(
		"/logout",
		async ({ cookie: { token }, headers, set }) => {
			const getToken = headers.authorization?.split(" ")[1];

			if (!getToken) {
				throw new AutorizationError("Token not provided");
			}

			set.status = 204;
			await authServices.logout(getToken);

			token.remove();
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
			const result = await authServices.forgotPassword(body.email);

			set.status = 200;
			return {
				status: "success",
				message: "Validation Success",
				data: {
					token: result,
				},
			};
		},
		{
			body: t.Object({
				email: t.String({ format: "email", error: "Format email tidak valid" }),
			}),
		},
	)

	.post(
		"/verify-forgot-password",
		async ({ body, set }) => {
			const result = await authServices.verifyForgotPassword(
				body.token,
				body.code,
			);
			set.status = 200;
			return {
				status: "success",
				message: "Verification Success",
				data: {
					token: result,
				},
			};
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
			await authServices.resetPassword(body.token, body.password);
			set.status = 200;
			return {
				status: "success",
				message: "Reset Password Success",
			};
		},
		{
			body: t.Object({
				token: t.String({
					minLength: 1,
					error: "Verification Error",
				}),
				password: t.String({
					minLength: 8,
					error: "Password harus memiliki minimal 8 karakter",
				}),
			}),
		},
	);
