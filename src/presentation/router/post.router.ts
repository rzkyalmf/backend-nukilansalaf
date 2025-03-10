import Elysia, { t } from "elysia";
import { postServices } from "../../application/instance";
import { authMiddleware } from "../middleware/autorization";

export const postRouter = new Elysia({ prefix: "/v1/posts" })
  .use(authMiddleware)

  // Routes get all posts (/api/v1/posts/)
  .get("/", async ({ userId, set }) => {
    const posts = await postServices.getAll(userId);
    set.status = 200;
    return {
      status: "success",
      message: "Success get all posts",
      data: posts,
    };
  })

  // Routes get one post (/api/v1/posts/:id)
  .get("/:id", async ({ params, set }) => {
    const post = await postServices.getOne(params.id);
    set.status = 200;
    return post;
  })

  // Routes create post (/api/v1/posts)
  .post(
    "/",
    async ({ body, userId, set }) => {
      const { title, content } = body;

      const newPost = await postServices.create({
        userId,
        title,
        slug: title,
        content,
      });

      set.status = 201;
      return newPost;
    },
    {
      body: t.Object({
        title: t.String({
          minLength: 3,
          maxLength: 100,
          error: "Judul hanya bisa memiliki 3-100 karakter",
        }),
        content: t.String({
          minLength: 10,
          error: "Konten harus memiliki minimal 10 karakter",
        }),
      }),
    }
  )

  // Routes update post (/api/v1/posts/:id)
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const { title, content } = body;
      const updatedPost = await postServices.update(params.id, {
        title,
        content,
      });

      set.status = 200;
      return updatedPost;
    },
    {
      body: t.Object({
        title: t.String(),
        content: t.String(),
      }),
    }
  )

  // Routes delete post (/api/v1/posts/:id)
  .delete("/:id", async ({ params, set }) => {
    set.status = 204;
    await postServices.delete(params.id);
  });
