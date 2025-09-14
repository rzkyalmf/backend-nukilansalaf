import type {
  CreateSection,
  UpdateSection,
} from "@infra/entity/types/section/section.types";
import type { Section } from "@prisma/client";

export interface ISection {
  getAll: (contributorId: string) => Promise<Section[]>;
  getAllPublished: () => Promise<Section[]>;
  getOne: (id: string) => Promise<Section>;
  create: (data: CreateSection) => Promise<Section>;
  update: (id: string, data: UpdateSection) => Promise<Section>;
  delete: (id: string) => Promise<void>;
  assignArticlesToSection: (sectionId: string, articleIds: string[]) => Promise<void>;
}