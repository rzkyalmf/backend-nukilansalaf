import type { IEmailService } from "@app/communications/mail/interfaces/email.interface";
import { UserDTO } from "@app/dtos/user.DTO";
import { JWTError } from "@app/security/jwt/errors/jwt.error";
import type { IJWT } from "@app/security/jwt/interfaces/jwt.interface";
import { AuthorizationError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { ICodeOtp } from "@infra/entity/interfaces/auth/code-otp.interface";
import type { ITokenBlacklist } from "@infra/entity/interfaces/auth/token-blacklist.interface";
import type { IUser } from "@infra/entity/interfaces/user/user.interface";
import { NotFoundError } from "elysia";
import { inject, injectable } from "inversify";
import * as crypto from "node:crypto";
import "reflect-metadata";

@injectable()
export class AuthServices {
  constructor(
    @inject(TYPES.userRepo) private userRepo: IUser,
    @inject(TYPES.otpRepo) private OtpRepo: ICodeOtp,
    @inject(TYPES.emailServices) private emailServices: IEmailService,
    @inject(TYPES.jwt) private jwt: IJWT,
    @inject(TYPES.tokenBlacklist) private tokenBlacklist: ITokenBlacklist
  ) {}

  async registerUser(
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ) {
    try {
      const user = await this.userRepo.getOne(email);

      if (!user.isVerified) {
        const hashedPassword = await Bun.password.hash(password);

        const randomNumber = crypto.randomInt(1000, 9999).toString();
        const setUsername = first_name.toLowerCase() + randomNumber;

        const updatedUser = await this.userRepo.update(user.id, {
          first_name,
          last_name,
          username: setUsername,
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

      throw new AuthorizationError("Email User sudah terdaftar");
    } catch (error) {
      if (error instanceof NotFoundError) {
        const hashedPassword = await Bun.password.hash(password);

        const randomNumber = crypto.randomInt(1000, 9999).toString();
        const setUsername = first_name.toLowerCase() + randomNumber;

        const newUser = await this.userRepo.create({
          first_name,
          last_name,
          username: setUsername,
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
        throw new AuthorizationError("User already verified");
      }

      const otp = await this.OtpRepo.getOne(code);

      if (otp.userId !== user.id) {
        throw new AuthorizationError("Kode OTP Salah");
      }

      await this.OtpRepo.delete(otp.id);
      await this.userRepo.update(payload.id, { isVerified: true });

      await this.emailServices.sendVerificationSuccessEmail(user.email);

      return new UserDTO(user).fromEntity();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new AuthorizationError("Kode OTP Salah");
      }

      if (error instanceof JWTError) {
        throw new AuthorizationError("Verification Error");
      }

      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await this.userRepo.getOne(email);

      if (!user.isVerified) {
        throw new AuthorizationError(
          "account not verified, check your email for verification"
        );
      }

      if (user.onBanned) {
        throw new AuthorizationError("account is banned");
      }

      if (!user.password) {
        throw new AuthorizationError("Please login via google account");
      }

      const matchPassword = await Bun.password.verify(password, user.password);

      if (!matchPassword) {
        throw new AuthorizationError("Password Salah");
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
        throw new AuthorizationError("Akun tidak ditemukan");
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
        throw new AuthorizationError("account not verified");
      }

      if (user.onBanned) {
        throw new AuthorizationError("account is banned");
      }

      return user;
    } catch (error) {
      if (error instanceof JWTError) {
        throw new AuthorizationError("Verification Error");
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
        throw new AuthorizationError("Verification Error");
      }
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userRepo.getOne(email);

      if (!user.isVerified) {
        throw new AuthorizationError(
          "Akun belum terverifikasi, cek email atau daftar ulang."
        );
      }

      if (!user.password) {
        throw new AuthorizationError("Please login via google account");
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
        throw new AuthorizationError("Email tidak ditemukan");
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
        throw new AuthorizationError("Invalid OTP code");
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
        throw new AuthorizationError("Invalid OTP code");
      }

      if (error instanceof JWTError) {
        throw new AuthorizationError("Verification Error");
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
        throw new AuthorizationError("Invalid OTP code");
      }

      if (error instanceof JWTError) {
        throw new AuthorizationError("Verification Error");
      }
    }
  }
}
