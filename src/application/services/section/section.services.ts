import { DBError } from "@infra/entity/error";
import { TYPES } from "@infra/entity/injection-tokens";
import type { ISection } from "@infra/entity/interfaces/section/section.interface";
import type {
  CreateSection,
  UpdateSection,
} from "@infra/entity/types/section/section.types";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import slugify from "slugify";

@injectable()
export class SectionServices {
  constructor(@inject(TYPES.sectionRepo) private sectionRepo: ISection) {}

  async getAll(contributorId: string) {
    try {
      const sections = await this.sectionRepo.getAll(contributorId);
      return sections;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async getAllPublished() {
    try {
      const sections = await this.sectionRepo.getAllPublished();
      return sections;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async getOne(id: string) {
    try {
      const section = await this.sectionRepo.getOne(id);
      return section;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async create(data: CreateSection, articleIds: string[]) {
    try {
      const options = {
        lower: true,
        remove: /[*+~.()'"`;!:@]/g,
        strict: true,
      };

      const titleSlug = slugify(data.title, options);

      data.slug = titleSlug;

      const newData = await this.sectionRepo.create(data);

      // Assign articles to section if articleIds provided
      if (articleIds && articleIds.length > 0) {
        await this.sectionRepo.assignArticlesToSection(newData.id, articleIds);
      }

      return newData;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async update(sectionId: string, data: UpdateSection, articleIds: string[]) {
    try {
      const isSectionExist = await this.sectionRepo.getOne(sectionId);

      if (data.title && data.title !== isSectionExist.title) {
        const options = {
          lower: true,
          remove: /[*+~.()'";!:@]/g,
          strict: true,
        };
        const titleSlug = slugify(data.title, options);
        data.slug = titleSlug;
      }

      const updatedData = await this.sectionRepo.update(sectionId, data);

      if (articleIds && articleIds.length > 0) {
        await this.sectionRepo.assignArticlesToSection(sectionId, articleIds);
      }

      return updatedData;
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }

  async delete(sectionId: string) {
    try {
      await this.sectionRepo.delete(sectionId);
    } catch (error) {
      if (error instanceof DBError) {
        throw error;
      }
      throw error;
    }
  }
}
