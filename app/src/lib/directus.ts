import { createDirectus, rest, readItems } from "@directus/sdk";

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;

const client = createDirectus(DIRECTUS_URL).with(rest());

export async function fetchPageBlocks(slug: string) {
  const pages = await client.request(
    readItems("page", {
      filter: {
        slug: { _eq: slug },
      },
      fields: [
        "*",
        {
          blocks: [
            "*",
            {
              item: {
                block_hero_banner: [
                  "*",
                  {
                    image_desktop: ["id", "description"],
                  },
                  { image_mobile: ["id", "description"] },
                ],
                block_mission: [
                  "id",
                  "title",
                  "description",
                  {
                    missions: [
                      "id",
                      "collection",
                      {
                        item: {
                          mission: ["id", "title", "description"],
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        { seo: ["*"] },
      ],
      limit: 1,
    })
  );

  return pages[0] || []; // Return blocks array or empty if not found
}
export default client;
