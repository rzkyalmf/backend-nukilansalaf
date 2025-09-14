export class DBError extends Error {
	public status: number; // HTTP status code 500 untuk database error
	public code: "DB_ERROR";
	constructor(message: string) {
		super(message);
		this.status = 500; // Internal server error
		this.code = "DB_ERROR"; // Error saat mengakses database
	}
}

export class AuthorizationError extends Error {
	public status: number; // HTTP status 401 untuk unauthorized
	public code: "AUTHORIZATION_ERROR";

	constructor(message: string) {
		super(message);
		this.status = 401; // Unauthorized access
		this.code = "AUTHORIZATION_ERROR"; // Error saat autentikasi/autorisasi
	}
}

export class NotFoundError extends Error {
	public status: number; // HTTP status untuk resource not found
	public code: "NOTFOUND_ERROR";

	constructor(message: string) {
		super(message);
		this.status = 404; // Resource tidak ditemukan
		this.code = "NOTFOUND_ERROR"; // Error saat data tidak ada
	}
}

export class ValidationError extends Error {
	public status: number;
	public code: "VALIDATION_ERROR";

	constructor(message: string) {
		super(message);
		this.status = 400;
		this.code = "VALIDATION_ERROR";
	}
}
