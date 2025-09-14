import type { IJWT } from "@app/security/jwt/interfaces/jwt.interface";
import { resend } from "@infra/communications/mail/resend.config";
import { TYPES } from "@infra/entity/injection-tokens";
import type { IUser } from "@infra/entity/interfaces/user/user.interface";
import { inject, injectable } from "inversify";
import { EmailError } from "./errors/email.error";
import type { IEmailService } from "./interfaces/email.interface";

@injectable()
export class EmailServices implements IEmailService {
	constructor(
		@inject(TYPES.userRepo) private userRepo: IUser,
		@inject(TYPES.jwt) private jwt: IJWT,
	) {}

	async sendVerificationCode(token: string, code: string) {
		try {
			const payload = await this.jwt.verify(token);
			const user = await this.userRepo.getOne(payload.id);

			const { data, error } = await resend.emails.send({
				from: "Nukilan Salaf <admission@nukilansalaf.com>",
				to: [user.email],
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

	async sendVerificationSuccessEmail(email: string) {
		try {
			const { data, error } = await resend.emails.send({
				from: "Nukilan Salaf <admission@nukilansalaf.com>",
				to: [email],
				subject: "Selamat Datang di Nukilan Salaf!",
				html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4a5568;">Akun Anda Berhasil Dibuat!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;">Assalamualaikum Wr. Wb.,</p>
            
            <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;">Alhamdulillah, verifikasi akun Anda pada platform <b>Nukilan Salaf</b> telah berhasil. Sekarang Anda dapat mengakses semua fitur yang tersedia di platform kami.</p>
            
            <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;">Silakan login menggunakan email dan password yang telah Anda daftarkan:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://nukilansalaf.com/login" style="background-color: #C2B59B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Sekarang</a>
            </div>
          </div>
          
          <div style="font-size: 14px; color: #666; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            <p>Jika Anda memiliki pertanyaan, silakan hubungi kami di <a href="mailto:support@nukilansalaf.com" style="color: #C2B59B;">support@nukilansalaf.com</a></p>
            <p>&copy; ${new Date().getFullYear()} Nukilan Salaf. Seluruh hak cipta dilindungi.</p>
          </div>
        </div>
      `,
			});

			if (error) {
				console.error("Resend error:", error);
				throw new EmailError("Gagal mengirim email konfirmasi");
			}
			return;
		} catch (error) {
			console.error("Email error:", error);
			throw new EmailError("Terjadi kesalahan saat mengirim email konfirmasi");
		}
	}

	async sendForgotPasswordCode(token: string, code: string) {
		try {
			const payload = await this.jwt.verify(token);
			const user = await this.userRepo.getOne(payload.id);

			const { data, error } = await resend.emails.send({
				from: "Nukilan Salaf <admission@nukilansalaf.com>",
				to: [user.email],
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

	async sendPasswordResetSuccessEmail(email: string) {
		try {
			const { data, error } = await resend.emails.send({
				from: "Nukilan Salaf <admission@nukilansalaf.com>",
				to: [email],
				subject: "Password Anda Berhasil Diubah - Nukilan Salaf",
				html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4a5568;">Password Berhasil Diubah</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;">Assalamualaikum Wr. Wb.,</p>
            
            <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;">Password akun Nukilan Salaf Anda telah berhasil diubah.</p>
            
            <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;">Jika Anda tidak melakukan perubahan ini, segera hubungi tim dukungan kami di <a href="mailto:support@nukilansalaf.com" style="color: #C2B59B;">support@nukilansalaf.com</a>.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://nukilansalaf.com/login" style="background-color: #C2B59B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Sekarang</a>
            </div>
            
            <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;"><b>Catatan Keamanan:</b> Jangan pernah membagikan password Anda kepada siapapun, termasuk staf Nukilan Salaf. Tim kami tidak akan pernah meminta password Anda.</p>
          </div>
          
          <div style="font-size: 14px; color: #666; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            <p>Jika Anda memiliki pertanyaan, silakan hubungi kami di <a href="mailto:support@nukilansalaf.com" style="color: #C2B59B;">support@nukilansalaf.com</a></p>
            <p>&copy; ${new Date().getFullYear()} Nukilan Salaf. Seluruh hak cipta dilindungi.</p>
          </div>
        </div>
      `,
			});

			if (error) {
				console.error("Resend error:", error);
				throw new EmailError("Gagal mengirim email konfirmasi reset password");
			}
			return;
		} catch (error) {
			console.error("Email error:", error);
			throw new EmailError(
				"Terjadi kesalahan saat mengirim email konfirmasi reset password",
			);
		}
	}
}
