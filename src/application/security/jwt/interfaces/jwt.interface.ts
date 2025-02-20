import type { User } from "@prisma/client";

export type JWTPayload = Pick<
	User,
	"id" | "username" | "email" | "name" | "role"
> & {
	type: string;
};

export interface IJWT {
	sign(payload: JWTPayload): Promise<string>;
	verify(token: string): Promise<JWTPayload>;
}
