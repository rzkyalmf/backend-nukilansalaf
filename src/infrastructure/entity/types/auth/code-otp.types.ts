import type { CodeOtp } from "@prisma/client";

export type CreateOTP = Omit<CodeOtp, "id" | "createdAt" | "updatedAt">;
