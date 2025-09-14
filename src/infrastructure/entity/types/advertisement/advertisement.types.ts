import type { Advertisement } from "@prisma/client";

export type CreateAdvertisement = Omit<
	Advertisement,
	"id" | "createdAt" | "updatedAt"
>;

export type UpdateAdvertisement = Partial<Advertisement>;
