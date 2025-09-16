import directus from "../directus";
import { readItems } from "@directus/sdk";

export const getAllSupportedProjects = () =>
  directus.request(
    readItems("supported_project", {
      fields: [
        "id",
        "title",
        "subtitle",
        "text",
        "date_created",
        { image: ["id", "description"] },
        { button: ["*", { item: ["*"] }] },
      ],
      filter: {
        status: { _eq: "published" },
      },
      sort: ["-date_created"],
      limit: -1,
    })
  );
