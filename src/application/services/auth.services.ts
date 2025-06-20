import { inject, injectable } from "inversify";
import * as crypto from "node:crypto";
import "reflect-metadata";
import {
	AutorizationError,
	NotFoundError,
} from "../../infrastructure/entity/error";
import type {
	ICodeOtp,
	ITokenBlacklist,
	IUser,
} from "../../infrastructure/entity/interface";
import { TYPES } from "../../infrastructure/entity/types";
import type { IEmailService } from "../communications/mail/interfaces/email.interface";
import { UserDTO } from "../dtos/user.DTO";
import type { IJWT } from "../security/jwt/interfaces/jwt.interface";

import { JWTError } from "../security/jwt/errors/jwt.error";

@injectable()
export class AuthServices {
	constructor(
		@inject(TYPES.userRepo) private userRepo: IUser,
		@inject(TYPES.otpRepo) private OtpRepo: ICodeOtp,
		@inject(TYPES.emailServices) private emailServices: IEmailService,
		@inject(TYPES.jwt) private jwt: IJWT,
		@inject(TYPES.tokenBlacklist) private tokenBlacklist: ITokenBlacklist,
	) {}

	async registerUser(
		name: string,
		username: string,
		email: string,
		password: string,
	) {
		try {
			const user = await this.userRepo.getOne(email);

			if (!user.isVerified) {
				const isUserExist = await this.userRepo.findByUsername(username);

				if (isUserExist && user.username !== username) {
					throw new AutorizationError("Username telah digunakan");
				}

				const hashedPassword = await Bun.password.hash(password);

				const updatedUser = await this.userRepo.update(user.id, {
					name,
					username,
					password: hashedPassword,
					avatar: "",
				});

				const generateCode = crypto.randomInt(100000, 999999).toString();
				await this.OtpRepo.create({
					userId: updatedUser.id,
					code: generateCode,
				});

				const token = await this.jwt.sign({
					id: updatedUser.id,
					role: updatedUser.role,

					type: "verify",
				});

				await this.emailServices.sendVerificationCode(token, generateCode);

				return token;
			}

			throw new AutorizationError("Email User sudah terdaftar");
		} catch (error) {
			if (error instanceof NotFoundError) {
				const isUserExist = await this.userRepo.findByUsername(username);

				if (isUserExist) {
					throw new AutorizationError("Username telah digunakan");
				}

				const hashedPassword = await Bun.password.hash(password);
				const newUser = await this.userRepo.create({
					name,
					username,
					email,
					password: hashedPassword,
					avatar: "",
				});

				const generateCode = crypto.randomInt(100000, 999999).toString();
				await this.OtpRepo.create({ userId: newUser.id, code: generateCode });

				const token = await this.jwt.sign({
					id: newUser.id,
					role: newUser.role,

					type: "register-user",
				});

				await this.emailServices.sendVerificationCode(token, generateCode);

				return token;
			}
			throw error;
		}
	}

	async verifyRegistration(token: string, code: string) {
		try {
			const payload = await this.jwt.verify(token);
			const user = await this.userRepo.getOne(payload.id);

			if (user.isVerified) {
				throw new AutorizationError("User already verified");
			}

			const otp = await this.OtpRepo.getOne(code);

			if (otp.userId !== user.id) {
				throw new AutorizationError("Kode OTP Salah");
			}

			await this.OtpRepo.delete(otp.id);
			await this.userRepo.update(payload.id, { isVerified: true });

			await this.emailServices.sendVerificationSuccessEmail(user.email);

			return new UserDTO(user).fromEntity();
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw new AutorizationError("Kode OTP Salah");
			}

			if (error instanceof JWTError) {
				throw new AutorizationError("Verification Error");
			}

			throw error;
		}
	}

	async loginUser(email: string, password: string) {
		try {
			const user = await this.userRepo.getOne(email);

			if (!user.isVerified) {
				throw new AutorizationError(
					"account not verified, check your email for verification",
				);
			}

			if (user.onBanned) {
				throw new AutorizationError("account is banned");
			}

			if (!user.password) {
				throw new AutorizationError("Please login via google account");
			}

			const matchPassword = await Bun.password.verify(password, user.password);

			if (!matchPassword) {
				throw new AutorizationError("Password Salah");
			}

			const token = await this.jwt.sign({
				id: user.id,
				role: user.role,

				type: "login",
			});

			return {
				token,
			};
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw new AutorizationError("Akun tidak ditemukan");
			}
			throw error;
		}
	}

	async verifyAccessToken(token: string) {
		try {
			await this.tokenBlacklist.isBlacklisted(token);
			const payload = await this.jwt.verify(token);
			const user = await this.userRepo.getOne(payload.id);

			if (!user.isVerified) {
				throw new AutorizationError("account not verified");
			}

			if (user.onBanned) {
				throw new AutorizationError("account is banned");
			}

			return user;
		} catch (error) {
			if (error instanceof JWTError) {
				throw new AutorizationError("Verification Error");
			}
			throw error;
		}
	}

	async logout(token: string) {
		try {
			await this.jwt.verify(token);
			await this.tokenBlacklist.addToBlacklist(token);
		} catch (error) {
			if (error instanceof JWTError) {
				throw new AutorizationError("Verification Error");
			}
			throw error;
		}
	}

	async forgotPassword(email: string) {
		try {
			const user = await this.userRepo.getOne(email);

			if (!user.isVerified) {
				throw new AutorizationError(
					"Akun belum terverifikasi, cek email atau daftar ulang.",
				);
			}

			if (!user.password) {
				throw new AutorizationError("Please login via google account");
			}

			const generateCode = crypto.randomInt(100000, 999999).toString();
			await this.OtpRepo.create({
				userId: user.id,
				code: generateCode,
			});

			const token = await this.jwt.sign({
				id: user.id,
				role: user.role,

				type: "forgot-password",
			});

			await this.emailServices.sendForgotPasswordCode(token, generateCode);

			return token;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw new AutorizationError("Email tidak ditemukan");
			}
			throw error;
		}
	}

	async verifyForgotPassword(token: string, code: string) {
		try {
			const payload = await this.jwt.verify(token);
			const user = await this.userRepo.getOne(payload.id);
			const otp = await this.OtpRepo.getOne(code);

			if (otp.userId !== user.id) {
				throw new AutorizationError("Invalid OTP code");
			}

			await this.OtpRepo.delete(otp.id);

			const newToken = await this.jwt.sign({
				id: user.id,
				role: user.role,

				type: "verify-forgot-password",
			});

			return newToken;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw new AutorizationError("Invalid OTP code");
			}

			if (error instanceof JWTError) {
				throw new AutorizationError("Verification Error");
			}

			throw error;
		}
	}

	async resetPassword(token: string, password: string) {
		try {
			const payload = await this.jwt.verify(token);
			const user = await this.userRepo.getOne(payload.id);

			const hashedPassword = await Bun.password.hash(password);
			await this.userRepo.update(user.id, {
				password: hashedPassword,
			});

			await this.emailServices.sendPasswordResetSuccessEmail(user.email);

			return;
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw new AutorizationError("Invalid OTP code");
			}

			if (error instanceof JWTError) {
				throw new AutorizationError("Verification Error");
			}
		}
	}
}
