import type {
  CreateUser,
  UpdateUser,
} from "@infra/entity/types/user/user.types";
import type { User } from "@prisma/client";

export interface IUser {
  getAll: () => Promise<User[]>;
  getOne: (userIdOrEmail: string) => Promise<User>;
  create: (data: CreateUser) => Promise<User>;
  update: (id: string, data: UpdateUser) => Promise<User>;

  findByUsername: (username: string) => Promise<boolean>;
}
