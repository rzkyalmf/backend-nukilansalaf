import "reflect-metadata";

import { DBError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { ICodeOtp } from "@infra/entity/interfaces/auth/code-otp.interface";
import type { CreateOTP } from "@infra/entity/types/auth/code-otp.types";
import { Prisma, type PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { inject, injectable } from "inversify";

@injectable()
export class OtpRepository implements ICodeOtp {
  constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

  async getOne(userIdorCode: string) {
    try {
      const data = await this.prisma.codeOtp.findFirst({
        where: {
          OR: [
            {
              userId: userIdorCode,
            },
            {
              code: userIdorCode,
            },
          ],
        },
      });

      if (!data) {
        throw new NotFoundError("Data not founds");
      }

      return data;
    } catch (error) {
      console.error(`${this.constructor.name}.getOne failed:`, error);
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new DBError("Failed to retrieve OTP from database");
    }
  }

  async create(data: CreateOTP) {
    try {
      const newCode = await this.prisma.codeOtp.upsert({
        where: {
          userId: data.userId,
        },
        update: {
          code: data.code,
        },
        create: data,
      });

      return newCode;
    } catch (error) {
      console.error(`${this.constructor.name}.create failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new DBError("OTP for this email already exists");
        }
        throw new DBError("Failed to create OTP in database");
      }

      throw new DBError("Unexpected error occurred while creating OTP");
    }
  }

  async delete(otpId: string) {
    try {
      await this.prisma.codeOtp.delete({
        where: {
          id: otpId,
        },
      });
    } catch (error) {
      console.error(`${this.constructor.name}.delete failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("OTP not found");
        }
        throw new DBError("Failed to delete OTP from database");
      }

      throw new DBError("Unexpected error occurred while deleting OTP");
    }
  }
}
