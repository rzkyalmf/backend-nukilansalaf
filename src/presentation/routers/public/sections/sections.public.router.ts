import { sectionServices } from "@app/instance";
import Elysia, { t } from "elysia";

export const sectionsPublicRouter = new Elysia({ prefix: "/sections" })
	// Get all published sections (public access)
	.get("/", async ({ set }) => {
		const sections = await sectionServices.getAllPublished();

		set.status = 200;
		return {
			status: "success",
			message: "Public sections retrieved successfully",
			data: sections,
		};
	})

	// Get specific section by ID (public access)
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
		},
	);
