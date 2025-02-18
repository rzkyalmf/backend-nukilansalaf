export interface IEmailService {
	sendVerificationCode(userId: string, code: string): Promise<void>;
	sendForgotPasswordCode(userId: string, code: string): Promise<void>;
}
