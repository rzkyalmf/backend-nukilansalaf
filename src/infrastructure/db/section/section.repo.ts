import "reflect-metadata";

import { DBError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { ISection } from "@infra/entity/interfaces/section/section.interface";
import type {
  CreateSection,
  UpdateSection,
} from "@infra/entity/types/section/section.types";
import { Prisma, type PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { inject, injectable } from "inversify";

@injectable()
export class SectionRepository implements ISection {
  constructor(@inject(TYPES.prisma) private prisma: PrismaClient) {}

  async getAll(contributorId: string) {
    try {
      const sections = await this.prisma.section.findMany({
        where: {
          contributorId,
        },
        include: {
          articles: true,
        },
      });

      return sections;
    } catch (error) {
      console.error(`${this.constructor.name}.getAll failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve section from database");
      }

      throw new DBError("Unexpected error occurred while retrieving section");
    }
  }

  async getAllPublished() {
    try {
      const sections = await this.prisma.section.findMany({
        include: {
          articles: {
            where: {
              published: true,
            },
          },
        },
      });

      return sections;
    } catch (error) {
      console.error(`${this.constructor.name}.getAllPublished failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve section from database");
      }

      throw new DBError("Unexpected error occurred while retrieving section");
    }
  }

  async getOne(idOrContributorId: string) {
    try {
      const section = await this.prisma.section.findFirst({
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

      if (!section) {
        throw new NotFoundError("Data not found");
      }

      return section;
    } catch (error) {
      console.error(`${this.constructor.name}.getOne failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to retrieve section from database");
      }

      throw new DBError("Unexpected error occurred while retrieving section");
    }
  }

  async create(data: CreateSection) {
    try {
      const newSection = await this.prisma.section.create({
        data,
      });

      return newSection;
    } catch (error) {
      console.error(`${this.constructor.name}.create failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to create section in database");
      }

      throw new DBError("Unexpected error occurred while creating section");
    }
  }

  async update(sectionId: string, data: UpdateSection) {
    try {
      const updatedSection = await this.prisma.section.update({
        where: {
          id: sectionId,
        },
        data,
      });

      return updatedSection;
    } catch (error) {
      console.error(`${this.constructor.name}.update failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to update section in database");
      }

      throw new DBError("Unexpected error occurred while updating section");
    }
  }

  async delete(sectionId: string) {
    try {
      await this.prisma.section.delete({
        where: {
          id: sectionId,
        },
      });
    } catch (error) {
      console.error(`${this.constructor.name}.delete failed:`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to delete section in database");
      }

      throw new DBError("Unexpected error occurred while deleting section");
    }
  }

  async assignArticlesToSection(sectionId: string, articleIds: string[]) {
    try {
      await this.prisma.article.updateMany({
        where: {
          id: {
            in: articleIds,
          },
        },
        data: {
          sectionId,
        },
      });
    } catch (error) {
      console.error(
        `${this.constructor.name}.assignArticlesToSection failed:`,
        error
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DBError("Failed to assign articles to section in database");
      }

      throw new DBError(
        "Unexpected error occurred while assigning articles to section"
      );
    }
  }
}
