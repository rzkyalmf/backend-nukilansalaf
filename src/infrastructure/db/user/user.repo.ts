import "reflect-metadata";

import { DBError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { IUser } from "@infra/entity/interfaces/user/user.interface";
import type {
  CreateUser,
  UpdateUser,
} from "@infra/entity/types/user/user.types";
import { Prisma, type PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { inject, injectable } from "inversify";

@injectable()
export class UserRepository implements IUser {
  constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

  async getAll() {
    try {
      const users = await this.prisma.user.findMany();

      return users;
    } catch (error) {
      console.error(`${this.constructor.name}.getAll failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve users from database");
      }

      throw new DBError("Unexpected error occurred while retrieving users");
    }
  }

  async getOne(userIdOrEmail: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              id: userIdOrEmail,
            },
            {
              email: userIdOrEmail,
            },
            {
              username: userIdOrEmail,
            },
          ],
        },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      return user;
    } catch (error) {
      console.error(`${this.constructor.name}.getOne failed:`, error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve user from database");
      }
      throw new DBError("Unexpected error occurred while retrieving user");
    }
  }

  async create(data: CreateUser) {
    try {
      const newUser = await this.prisma.user.create({
        data,
      });

      return newUser;
    } catch (error) {
      console.error(`${this.constructor.name}.create failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new DBError("User with this email already exists");
        }
        throw new DBError("Failed to create user in database");
      }

      throw new DBError("Unexpected error occurred while creating user");
    }
  }

  async update(userId: string, data: UpdateUser) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data,
      });

      return updatedUser;
    } catch (error) {
      console.error(`${this.constructor.name}.update failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("User not found");
        }
        if (error.code === "P2002") {
          throw new DBError("User with this email already exists");
        }
        throw new DBError("Failed to update user in database");
      }

      throw new DBError("Unexpected error occurred while updating user");
    }
  }

  async findByUsername(username: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: username,
        },
      });

      return !!user;
    } catch (error) {
      console.error(`${this.constructor.name}.findByUsername failed:`, error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve user from database");
      }
      throw new DBError("Unexpected error occurred while retrieving user");
    }
  }
}
