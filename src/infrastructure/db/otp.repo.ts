import "reflect-metadata";

import { Prisma, type PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";

import { DBError, NotFoundError } from "../entity/error";
import type { CreateOTP, ICodeOtp, UpdateOTP } from "../entity/interface";
import { TYPES } from "../entity/types";

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
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DBError("Database error");
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Error getting resources from DB2");
      }

      throw new DBError("something went wrong while doing DB Operation");
    }
  }

  async update(otpId: string, data: UpdateOTP) {
    try {
      const updatedOtp = await this.prisma.codeOtp.update({
        where: {
          id: otpId,
        },
        data,
      });

      return updatedOtp;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Error getting resources from DB");
      }

      throw new DBError("something went wrong while doing DB Operation");
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Error getting resources from DB");
      }

      throw new DBError("something went wrong while doing DB Operation");
    }
  }
}
