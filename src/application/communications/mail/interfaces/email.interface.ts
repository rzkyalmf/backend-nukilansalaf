export interface IEmailService {
	sendVerificationCode(userId: string, code: string): Promise<void>;
	sendForgotPasswordCode(userId: string, code: string): Promise<void>;
	sendVerificationSuccessEmail(email: string): Promise<void>;
	sendPasswordResetSuccessEmail(email: string): Promise<void>;
}
