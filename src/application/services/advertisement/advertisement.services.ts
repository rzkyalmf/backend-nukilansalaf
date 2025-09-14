import { DBError, NotFoundError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { IAdvertisement } from "@infra/entity/interfaces/advertisement/advertisement.interface";
import type {
  CreateAdvertisement,
  UpdateAdvertisement,
} from "@infra/entity/types/advertisement/advertisement.types";
import { inject, injectable } from "inversify";

@injectable()
export class AdvertisementServices {
  constructor(
    @inject(TYPES.advertisementRepo) private advertisementRepo: IAdvertisement
  ) {}

  async getAll(contributorId: string) {
    try {
      const advertisements = await this.advertisementRepo.getAll(contributorId);
      return advertisements;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async getAllActive() {
    try {
      const advertisements = await this.advertisementRepo.getAllActive();
      return advertisements;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async getOne(id: string) {
    try {
      const advertisement = await this.advertisementRepo.getOne(id);
      return advertisement;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw error;
    }
  }

  async create(data: CreateAdvertisement, articleIds: string[]) {
    try {
      const newAdvertisement = await this.advertisementRepo.create(data);

      if (articleIds && articleIds.length > 0) {
        await this.advertisementRepo.assignArticlesToAdvertisement(
          newAdvertisement.id,
          articleIds
        );
      }

      return newAdvertisement;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async update(
    advertisementId: string,
    data: UpdateAdvertisement,
    articleIds: string[]
  ) {
    try {
      const updatedAdvertisement = await this.advertisementRepo.update(
        advertisementId,
        data
      );

      if (articleIds && articleIds.length > 0) {
        await this.advertisementRepo.assignArticlesToAdvertisement(
          advertisementId,
          articleIds
        );
      }

      return updatedAdvertisement;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async delete(advertisementId: string) {
    try {
      await this.advertisementRepo.delete(advertisementId);
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }
}
