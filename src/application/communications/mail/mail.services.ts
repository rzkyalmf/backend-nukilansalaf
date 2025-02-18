import { inject, injectable } from "inversify";
import { resend } from "../../../infrastructure/communications/mail/resend.config";
import type { IJWT } from "../../security/jwt/interfaces/jwt.interface";
import type { IEmailService } from "./interfaces/email.interface";

import type { IUser } from "../../../infrastructure/entity/interface";
import { TYPES } from "../../../infrastructure/entity/types";

import { EmailError } from "./errors/email.error";

@injectable()
export class EmailServices implements IEmailService {
	constructor(
		@inject(TYPES.userRepo) private userRepo: IUser,
		@inject(TYPES.jwt) private jwt: IJWT,
	) {}

	async sendVerificationCode(token: string, code: string) {
		try {
			const payload = await this.jwt.verify(token);

			const { data, error } = await resend.emails.send({
				from: "Nukilan Salaf <admission@nukilansalaf.com>",
				to: [payload.email],
				subject: "Verifikasi Akun Nukilan Salaf!",
				html: `
          <p>Kode OTP : <b>${code}</b></p>
          <p>Link Verifikasi Akun : <a href="https://nukilansalaf.com/verify?token=${token}">Klik Disini!</a></p>
        `,
			});

			if (error) {
				console.error("Resend error:", error);
				throw new EmailError("Gagal mengirim email");
			}

			return;
		} catch (error) {
			console.error("Email error:", error);
			throw new EmailError("Terjadi kesalahan saat mengirim email");
		}
	}

	async sendForgotPasswordCode(token: string, code: string) {
		try {
			const payload = await this.jwt.verify(token);

			const { data, error } = await resend.emails.send({
				from: "Nukilan Salaf <admission@nukilansalaf.com>",
				to: [payload.email],
				subject: "Reset Password Nukilan Salaf!",
				html: `
          <p>Kode OTP : <b>${code}</b></p>
          <p>Link Reset Password : <a href="https://nukilansalaf.com/reset-password/verify?token=${token}">Klik Disini!</a></p>
        `,
			});

			if (error) {
				console.error("Resend error:", error);
				throw new EmailError("Gagal mengirim email");
			}

			return;
		} catch (error) {
			console.error("Email error:", error);
			throw new EmailError("Terjadi kesalahan saat mengirim email");
		}
	}
}
