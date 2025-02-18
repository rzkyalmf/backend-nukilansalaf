import { error } from "node:console";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { injectable } from "inversify";
import { JWTError } from "./errors/jwt.error";
import type { IJWT, JWTPayload } from "./interfaces/jwt.interface";

@injectable()
export class JWTProvider implements IJWT {
	private authVerificationHandler;
	private authSessionHandler;

	constructor() {
		if (!process.env.JWT_SECRET) {
			throw new Error("JWT_SECRET is not defined");
		}

		const app = new Elysia();

		this.authVerificationHandler = app.use(
			jwt({
				name: "jwt",
				secret: process.env.JWT_SECRET,
				exp: "1h",
			}),
		).decorator.jwt;

		this.authSessionHandler = app.use(
			jwt({
				name: "jwt",
				secret: process.env.JWT_SECRET,
				exp: "7d",
			}),
		).decorator.jwt;
	}

	async sign(payload: JWTPayload) {
		try {
			if (payload.type === "login") {
				return await this.authSessionHandler.sign(payload);
			}
			return await this.authVerificationHandler.sign(payload);
		} catch (error) {
			throw new JWTError("Error signing JWT");
		}
	}

	async verify(token: string) {
		try {
			const result = await this.authVerificationHandler.verify(token);

			if (!result) {
				throw error;
			}

			return result as JWTPayload;
		} catch (error) {
			throw new JWTError("Error verifying JWT");
		}
	}
}
