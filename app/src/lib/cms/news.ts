import directus from "../directus";
import { readItems } from "@directus/sdk";

export const getNewsCategories = () =>
  directus.request(
    readItems("news_category", {
      fields: ["name"],
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

// export const getNewsByCategorySlug = (slug: string) =>
//   directus.request(
//     readItems("news", {
//       fields: baseFields,
//       sort: ["-date_created"],
//       filter: {
//         status: { _eq: "published" },
//         category: { slug: { _eq: slug } },
//       },
//       limit: -1,
//     })
//   );
