import { DBError, NotFoundError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { IAdvertisement } from "@infra/entity/interfaces/advertisement/advertisement.interface";
import type {
  CreateAdvertisement,
  UpdateAdvertisement,
} from "@infra/entity/types/advertisement/advertisement.types";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { inject, injectable } from "inversify";

@injectable()
export class AdvertisementRepository implements IAdvertisement {
  constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

  async getAll(contributorId: string) {
    try {
      return await this.prisma.advertisement.findMany({
        where: {
          contributorId,
        },
        include: {
          articles: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error(`${this.constructor.name}.getAll failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve advertisement from database");
      }

      throw new DBError(
        "Unexpected error occurred while retrieving advertisement"
      );
    }
  }

  async getAllActive() {
    try {
      return await this.prisma.advertisement.findMany({
        where: {
          isActive: true,
        },
        include: {
          articles: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error(`${this.constructor.name}.getAllActive failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve advertisement from database");
      }

      throw new DBError(
        "Unexpected error occurred while retrieving advertisement"
      );
    }
  }

  async getOne(idOrContributorId: string) {
    try {
      const advertisement = await this.prisma.advertisement.findFirst({
        where: {
          OR: [
            {
              id: idOrContributorId,
            },
            {
              contributorId: idOrContributorId,
            },
          ],
        },
        include: {
          articles: true,
        },
      });

      if (!advertisement) {
        throw new NotFoundError("Data not found");
      }

      return advertisement;
    } catch (error) {
      console.error(`${this.constructor.name}.getOne failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve advertisement from database");
      }

      throw new DBError(
        "Unexpected error occurred while retrieving advertisement"
      );
    }
  }

  async create(data: CreateAdvertisement) {
    try {
      const newAdvertisement = await this.prisma.advertisement.create({
        data,
      });

      return newAdvertisement;
    } catch (error) {
      console.error(`${this.constructor.name}.create failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to create advertisement in database");
      }

      throw new DBError(
        "Unexpected error occurred while creating advertisement"
      );
    }
  }

  async update(advertisementId: string, data: UpdateAdvertisement) {
    try {
      const updateAdvertisement = await this.prisma.advertisement.update({
        where: { id: advertisementId },
        data,
      });

      return updateAdvertisement;
    } catch (error) {
      console.error(`${this.constructor.name}.update failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to update advertisement in database");
      }

      throw new DBError(
        "Unexpected error occurred while updating advertisement"
      );
    }
  }

  async delete(advertisementId: string) {
    try {
      await this.prisma.advertisement.delete({
        where: {
          id: advertisementId,
        },
      });
    } catch (error) {
      console.error(`${this.constructor.name}.delete failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to delete advertisement in database");
      }

      throw new DBError(
        "Unexpected error occurred while deleting advertisement"
      );
    }
  }

  async assignArticlesToAdvertisement(
    advertisementId: string,
    articleIds: string[]
  ) {
    try {
      await this.prisma.advertisement.update({
        where: {
          id: advertisementId,
        },
        data: {
          articles: {
            connect: articleIds.map((id) => ({ id })),
          },
        },
      });
    } catch (error) {
      console.error(
        `${this.constructor.name}.assignArticlesToAdvertisement failed:`,
        error
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError(
          "Failed to assign articles to advertisement in database"
        );
      }

      throw new DBError(
        "Unexpected error occurred while assigning articles to advertisement"
      );
    }
  }
}
