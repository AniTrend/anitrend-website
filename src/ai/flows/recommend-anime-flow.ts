'use server';
/**
 * @fileOverview An AI flow for recommending anime.
 *
 * - recommendAnime - A function that recommends an anime based on a user prompt.
 * - RecommendAnimeInput - The input type for the recommendAnime function.
 * - RecommendAnimeOutput - The return type for the recommendAnime function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecommendAnimeInputSchema = z.object({
  prompt: z.string().describe('The user\'s description of what they want to watch.'),
});
export type RecommendAnimeInput = z.infer<typeof RecommendAnimeInputSchema>;

const RecommendAnimeOutputSchema = z.object({
  animeId: z.string().describe('The ID of the recommended anime.'),
  title: z.string().describe('The title of the recommended anime.'),
  reason: z.string().describe('A short explanation for why this anime was recommended based on the user\'s prompt.'),
});
export type RecommendAnimeOutput = z.infer<typeof RecommendAnimeOutputSchema>;

// Exported wrapper function to be called from the client
export async function recommendAnime(input: RecommendAnimeInput): Promise<RecommendAnimeOutput | null> {
  return recommendAnimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendAnimePrompt',
  input: { schema: RecommendAnimeInputSchema },
  output: { schema: RecommendAnimeOutputSchema },
  prompt: `You are an expert anime recommender called AniTrend AI. Your goal is to help users find the perfect anime to watch from a provided list based on their preferences.

Analyze the user's prompt and the list of available anime. The list of anime is provided as a JSON string.

User's Request:
"{{{prompt}}}"

Available Anime Catalog (JSON):
\`\`\`json
{{{animeList}}}
\`\`\`

Based on the user's request, select the single best anime from the catalog. Your selection MUST come from the provided list. Then, provide a brief, friendly, and compelling reason for your recommendation. Your reason should directly reference the user's prompt.

Your output must be in the specified JSON format.
`,
});

const recommendAnimeFlow = ai.defineFlow(
  {
    name: 'recommendAnimeFlow',
    inputSchema: RecommendAnimeInputSchema,
    outputSchema: RecommendAnimeOutputSchema,
  },
  async (input) => {
    // Fetch top anime from Jikan API
    const response = await fetch('https://api.jikan.moe/v4/top/anime');
    if (!response.ok) {
        console.error("Failed to fetch from Jikan API");
        return null;
    }
    const jikanData = await response.json();

    // Convert the Jikan data to a simplified JSON string to pass to the prompt
    const animeList = jikanData.data.map((anime: any) => ({
      id: anime.mal_id.toString(),
      title: anime.title_english || anime.title,
      synopsis: anime.synopsis,
      genres: anime.genres.map((g: any) => g.name),
      score: anime.score,
      rank: anime.rank,
      popularity: anime.popularity,
      status: anime.status,
    }));
    
    const animeListJson = JSON.stringify(animeList);

    const { output } = await prompt({
      ...input,
      animeList: animeListJson,
    });
    
    return output;
  }
);
