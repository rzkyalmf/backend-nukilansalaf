import { sectionServices } from "@app/instance";
import { authMiddleware } from "@present/middleware/authorization";
import Elysia, { t } from "elysia";

export const sectionsRouter = new Elysia({ prefix: "/sections" })
  .use(authMiddleware)

  // Routes get all sections by contributor (/api/v1/sections)
  .get("/", async ({ userId, set }) => {
    const sections = await sectionServices.getAll(userId);

    set.status = 200;
    return {
      status: "success",
      message: "Sections retrieved successfully",
      data: sections,
    };
  })

  // Routes get one section (/api/v1/sections/:id)
  .get(
    "/:id",
    async ({ params, set }) => {
      const { id } = params;
      const section = await sectionServices.getOne(id);

      set.status = 200;
      return {
        status: "success",
        message: "Section retrieved successfully",
        data: section,
      };
    },
    {
      params: t.Object({
        id: t.String({
          minLength: 1,
          error: "Section ID is required",
        }),
      }),
    }
  )

  // Routes create sections (/api/v1/sections)
  .post(
    "/",
    async ({ body, userId, Role, set }) => {
      // Only ADMIN and CONTRIBUTOR can create sections
      if (Role !== "ADMIN" && Role !== "CONTRIBUTOR") {
        set.status = 403;
        return {
          status: "error",
          message: "Forbidden: Only admin and contributor can create sections",
        };
      }

      const { title, index, articleIds } = body;
      const newData = await sectionServices.create(
        {
          title,
          slug: title, // Will be processed in service
          index,
          contributorId: userId,
        },
        articleIds
      );

      set.status = 201;
      return {
        status: "success",
        message: "Success create section",
        data: newData,
      };
    },
    {
      body: t.Object({
        title: t.String({
          minLength: 3,
          maxLength: 100,
          error: "Judul hanya bisa memiliki 3-100 karakter",
        }),
        index: t.Number({
          minimum: 0,
          error: "Index harus berupa angka positif",
        }),
        articleIds: t.Array(
          t.String({
            minLength: 1,
            error: "Article ID tidak boleh kosong",
          }),
          {
            minItems: 1,
            error: "Section harus memiliki minimal 1 artikel",
          }
        ),
      }),
    }
  )

  // Routes update sections (/api/v1/sections/:id)
  .patch(
    "/:id",
    async ({ params, body, userId, Role, set }) => {
      // Check if section exists and get section data
      const section = await sectionServices.getOne(params.id);

      // Only ADMIN or section owner can update
      if (Role !== "ADMIN" && section.contributorId !== userId) {
        set.status = 403;
        return {
          status: "error",
          message:
            "Forbidden: You can only update your own sections or need admin privileges",
        };
      }

      const { title, index, articleIds } = body;
      const updatedData = await sectionServices.update(
        params.id,
        {
          title,
          index,
        },
        articleIds
      );

      set.status = 200;
      return {
        status: "success",
        message: "Success update section",
        data: updatedData,
      };
    },
    {
      body: t.Object({
        title: t.Optional(
          t.String({
            minLength: 3,
            maxLength: 100,
            error: "Judul hanya bisa memiliki 3-100 karakter",
          })
        ),
        index: t.Optional(
          t.Number({
            minimum: 0,
            error: "Index harus berupa angka positif",
          })
        ),
        articleIds: t.Array(
          t.String({
            minLength: 1,
            error: "Article ID tidak boleh kosong",
          }),
          {
            minItems: 1,
            error: "Section harus memiliki minimal 1 artikel",
          }
        ),
      }),
    }
  )

  // Routes delete sections (/api/v1/sections/:id)
  .delete("/:id", async ({ params, userId, Role, set }) => {
    // Check if section exists and get section data
    const section = await sectionServices.getOne(params.id);

    // Only ADMIN or section owner can delete
    if (Role !== "ADMIN" && section.contributorId !== userId) {
      set.status = 403;
      return {
        status: "error",
        message:
          "Forbidden: You can only delete your own sections or need admin privileges",
      };
    }

    set.status = 204;
    await sectionServices.delete(params.id);
  });
