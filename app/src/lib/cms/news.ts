import directus from "../directus";
import { readItems } from "@directus/sdk";

export const getNewsCategories = () =>
  directus.request(
    readItems("news_category", {
      fields: ["name", "slug"],
      filter: {
        status: { _eq: "published" },
        news: { status: { _eq: "published" } },
      },
      sort: ["sort", "name"],
      limit: -1,
    })
  );

export const getAllNews = () =>
  directus.request(
    readItems("news", {
      fields: [
        "id",
        "title",
        "description",
        "date_created",
        "status",
        { image: ["id", "description"] },
        { pdf_file: ["id"] },
        { button_link: ["*", { item: ["*"] }] },
        { category: ["id", "name", "slug", "status"] },
      ],
      filter: {
        status: { _eq: "published" },
        category: {
          _nnull: true,
          status: { _eq: "published" },
        },
      },
      sort: ["-date_created"],
      limit: -1,
    })
  );
