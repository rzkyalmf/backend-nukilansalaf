import "reflect-metadata";

import { DBError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { ITokenBlacklist } from "@infra/entity/interfaces/auth/token-blacklist.interface";
import { Prisma, type PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { inject, injectable } from "inversify";

@injectable()
export class TokenBlacklistRepository implements ITokenBlacklist {
  constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

  async isBlacklisted(token: string) {
    try {
      const blacklisted = await this.prisma.tokenBlacklist.findFirst({
        where: {
          token,
        },
      });

      if (blacklisted) {
        throw new NotFoundError("token is blacklisted");
      }

      return false;
    } catch (error) {
      console.error(`${this.constructor.name}.isBlacklisted failed:`, error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DBError("Failed to check token blacklist status in database");
    }
  }

  async addToBlacklist(token: string) {
    try {
      await this.prisma.tokenBlacklist.create({
        data: {
          token,
          expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (error) {
      console.error(`${this.constructor.name}.addToBlacklist failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new NotFoundError("Token already blacklisted");
        }
      }
      throw new DBError("Failed to add token to blacklist in database");
    }
  }
}
