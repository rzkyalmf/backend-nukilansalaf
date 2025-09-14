import type { User } from "@prisma/client";

export type CreateUser = Pick<
  User,
  "first_name" | "last_name" | "username" | "email" | "password" | "avatar"
>;
export type UpdateUser = Partial<User>;
