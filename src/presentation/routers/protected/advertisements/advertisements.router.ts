import { advertisementServices } from "@app/instance";
import { authMiddleware } from "@present/middleware/authorization";
import Elysia, { t } from "elysia";

export const advertisementsRouter = new Elysia({ prefix: "/advertisements" })
	.use(authMiddleware)

	// Routes get all advertisements (/api/v1/advertisements/)
	.get("/", async ({ userId, set }) => {
		const advertisements = await advertisementServices.getAll(userId);

		set.status = 200;
		return {
			success: "success",
			message: "Advertisements retrieved successfully",
			data: advertisements,
		};
	})

	// Routes get one advertisement (/api/v1/advertisements/:id)
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
		},
	)

	// Routes create advertisement (/api/v1/advertisements/)
	.post(
		"/",
		async ({ body, userId, Role, set }) => {
			// Only ADMIN and CONTRIBUTOR can create advertisements
			if (Role !== "ADMIN" && Role !== "CONTRIBUTOR") {
				set.status = 403;
				return {
					success: "error",
					message:
						"Access denied. Only admins and contributors can create advertisements.",
				};
			}

			const { title, imageUrl, linkUrl, isActive, articleIds } = body;
			const newData = await advertisementServices.create(
				{
					title,
					imageUrl,
					linkUrl,
					isActive,
					contributorId: userId,
				},
				articleIds,
			);

			set.status = 201;
			return {
				success: "success",
				message: "Advertisement created successfully",
				data: newData,
			};
		},
		{
			body: t.Object({
				title: t.String({
					minLength: 3,
					maxLength: 100,
					error: "Title must be between 3-100 characters",
				}),
				imageUrl: t.String({
					format: "uri",
					error: "Invalid image URL format",
				}),
				linkUrl: t.String({
					format: "uri",
					error: "Invalid link URL format",
				}),
				isActive: t.Boolean(),
				articleIds: t.Array(
					t.String({
						minLength: 1,
						error: "Article ID tidak boleh kosong",
					}),
					{
						minItems: 1,
						error: "Section harus memiliki minimal 1 artikel",
					},
				),
			}),
		},
	)

	// Routes update advertisement (/api/v1/advertisements/:id)
	.patch(
		"/:id",
		async ({ params, body, userId, Role, set }) => {
			// Check if advertisement exists and get owner info
			const advertisement = await advertisementServices.getOne(params.id);

			// Only ADMIN or the owner can update
			if (Role !== "ADMIN" && advertisement.contributorId !== userId) {
				set.status = 403;
				return {
					success: "error",
					message:
						"Access denied. You can only update your own advertisements.",
				};
			}

			const { title, imageUrl, linkUrl, isActive, articleIds } = body;
			const updateData = await advertisementServices.update(
				params.id,
				{
					title,
					imageUrl,
					linkUrl,
					isActive,
				},
				articleIds,
			);

			set.status = 200;
			return {
				success: "success",
				message: "Advertisement updated successfully",
				data: updateData,
			};
		},
		{
			body: t.Object({
				title: t.Optional(
					t.String({
						minLength: 3,
						maxLength: 100,
					}),
				),
				imageUrl: t.Optional(
					t.String({
						format: "uri",
					}),
				),
				linkUrl: t.Optional(
					t.String({
						format: "uri",
					}),
				),
				isActive: t.Optional(t.Boolean()),
				articleIds: t.Array(
					t.String({
						minLength: 1,
						error: "Article ID tidak boleh kosong",
					}),
					{
						minItems: 1,
						error: "Section harus memiliki minimal 1 artikel",
					},
				),
			}),
		},
	)

	// Routes delete advertisement (/api/v1/advertisements/:id)
	.delete("/:id", async ({ params, userId, Role, set }) => {
		// Check if advertisement exists and get owner info
		const advertisement = await advertisementServices.getOne(params.id);

		// Only ADMIN or the owner can delete
		if (Role !== "ADMIN" && advertisement.contributorId !== userId) {
			set.status = 403;
			return {
				success: "error",
				message: "Access denied. You can only delete your own advertisements.",
			};
		}

		set.status = 204;
		await advertisementServices.delete(params.id);
	});
