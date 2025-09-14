import { advertisementServices } from "@app/instance";
import Elysia, { t } from "elysia";

export const advertisementsPublicRouter = new Elysia({
  prefix: "/advertisements",
})
  // Routes get all active advertisements (/api/v1/public/advertisements/)
  .get("/", async ({ set }) => {
    const advertisements = await advertisementServices.getAllActive();

    set.status = 200;
    return {
      success: "success",
      message: "Active advertisements retrieved successfully",
      data: advertisements,
    };
  })

  // Routes get one advertisement (/api/v1/public/advertisements/:id)
  .get(
    "/:id",
    async ({ params, set }) => {
      const { id } = params;
      const advertisement = await advertisementServices.getOne(id);

      set.status = 200;
      return {
        success: "success",
        message: "Advertisement retrieved successfully",
        data: advertisement,
      };
    },
    {
      params: t.Object({
        id: t.String({
          minLength: 1,
          error: "Advertisement ID is required",
        }),
      }),
    }
  );
