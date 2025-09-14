import type { Section } from "@prisma/client";

export type CreateSection = Pick<
  Section,
  "title" | "slug" | "index" | "contributorId"
>;

export type UpdateSection = Partial<Section>;
