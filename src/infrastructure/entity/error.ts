export class DBError extends Error {
	public status: number; // HTTP status code 500 untuk database error
	public code: "DB_ERROR";
	constructor(message: string) {
		super(message);
		this.status = 500; // Internal server error
		this.code = "DB_ERROR"; // Error saat mengakses database
	}
}

export class AutorizationError extends Error {
	public status: number; // HTTP status 401 untuk unauthorized
	public code: "AUTORIZATION_ERROR";

	constructor(message: string) {
		super(message);
		this.status = 401; // Unauthorized access
		this.code = "AUTORIZATION_ERROR"; // Error saat autentikasi/autorisasi
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
