import type { CreateOTP } from "@infra/entity/types/auth/code-otp.types";
import type { CodeOtp } from "@prisma/client";

export interface ICodeOtp {
  getOne: (userIdorCode: string) => Promise<CodeOtp>;
  create: (data: CreateOTP) => Promise<CodeOtp>;
  delete: (id: string) => Promise<void>;
}
