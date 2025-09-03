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
                block_call_for_projects: [
                  "*",
                  { button: ["*", { item: ["*"] }] },
                  { image: ["id", "description"] },
                ],
                block_news: [
                  "title",
                  "description",
                  {
                    news: [
                      {
                        item: {
                          news: [
                            { image: ["id", "description"] },
                            { category: ["name"] },
                            "title",
                            "description",
                            { pdf_file: ["id"] },
                          ],
                        },
                      },
                    ],
                  },
                ],
                block_contact: [
                  "title",
                  "description",
                  { image_mobile: ["id", "description"] },
                  { image_desktop: ["id", "description"] },
                  { button: ["*", { item: ["*"] }] },
                ],
                block_news_grid: ["id"],
                block_stages_of_the_case: [
                  "id",
                  {
                    cases: [
                      "id",
                      "collection",
                      {
                        item: {
                          stage_case: [
                            "id",
                            "sort",
                            "title",
                            "section_type",
                            "information",
                            "content",
                            "detail_file_size",
                            {
                              calendar_items: [
                                "id",
                                "collection",
                                {
                                  item: {
                                    stages_case_calendar_item: [
                                      "id",
                                      "sort",
                                      "date",
                                      "title",
                                      "text",
                                    ],
                                  },
                                },
                              ],
                            },
                            { button: ["*", { item: ["*"] }] },
                            {
                              download_form_pdf: [
                                "id",
                                "filename_download",
                                "filesize",
                              ],
                            },
                          ],
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
