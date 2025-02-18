export class EmailError extends Error {
	public status: number;
	public code: "EMAIL_ERROR";

	constructor(message: string) {
		super(message);
		this.status = 500;
		this.code = "EMAIL_ERROR";
	}
}
