"use server";

import { jigsaw } from "../lib/jigsaw";

export async function search(query: string) {
  try {
    console.log("Searching for", query);
    const result = await jigsaw.web.search({
      query,
    });

    const sources = result.results.map(({ title, url }) => ({
      title,
      url,
    }));

    return { overview: result.ai_overview, sources: sources };
  } catch (error) {
    console.error(error);
  }
}
