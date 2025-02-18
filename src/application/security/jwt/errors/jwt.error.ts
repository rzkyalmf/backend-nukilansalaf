export class JWTError extends Error {
	public status: number;
	public code: "JWT_ERROR";

	constructor(message: string) {
		super(message);
		this.status = 401; // Unauthorized
		this.code = "JWT_ERROR";
	}
}
