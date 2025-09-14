import type {
  CreateAdvertisement,
  UpdateAdvertisement,
} from "@infra/entity/types/advertisement/advertisement.types";
import type { Advertisement } from "@prisma/client";

export interface IAdvertisement {
  getAll(contributorId: string): Promise<Advertisement[]>;
  getAllActive(): Promise<Advertisement[]>;
  getOne(idOrContributorId: string): Promise<Advertisement>;
  create(data: CreateAdvertisement): Promise<Advertisement>;
  update(id: string, data: UpdateAdvertisement): Promise<Advertisement>;
  delete(id: string): Promise<void>;
  assignArticlesToAdvertisement: (advertisementId: string, articleIds: string[]) => Promise<void>;
}
