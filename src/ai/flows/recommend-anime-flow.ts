'use server';
/**
 * @fileOverview An AI flow for recommending anime.
 *
 * - recommendAnime - A function that recommends an anime based on a user prompt.
 * - RecommendAnimeInput - The input type for the recommendAnime function.
 * - RecommendAnimeOutput - The return type for the recommendAnime function.
 */

import { ai } from '@/ai/genkit';
import { getRecommendationsForAI } from '@/lib/anime-service';
import { z } from 'zod';

const RecommendAnimeInputSchema = z.object({
  prompt: z
    .string()
    .describe("The user's description of what they want to watch."),
});
export type RecommendAnimeInput = z.infer<typeof RecommendAnimeInputSchema>;

const RecommendAnimeOutputSchema = z.object({
  animeId: z.string().describe('The ID of the recommended anime.'),
  title: z.string().describe('The title of the recommended anime.'),
  reason: z
    .string()
    .describe(
      "A short explanation for why this anime was recommended based on the user's prompt."
    ),
});
export type RecommendAnimeOutput = z.infer<typeof RecommendAnimeOutputSchema>;

// Exported wrapper function to be called from the client
export async function recommendAnime(
  input: RecommendAnimeInput
): Promise<RecommendAnimeOutput | null> {
  try {
    return await recommendAnimeFlow(input);
  } catch (error) {
    console.error('Error in recommendAnime:', error);
    return null;
  }
}

const prompt = ai.definePrompt({
  name: 'recommendAnimePrompt',
  input: {
    schema: RecommendAnimeInputSchema.extend({
      animeList: z
        .string()
        .describe('JSON string of available anime with recommendation context'),
    }),
  },
  output: { schema: RecommendAnimeOutputSchema },
  prompt: `You are an expert anime recommender called AniTrend AI. Your goal is to help users find the perfect anime to watch from a provided list based on their preferences.

You have access to real community recommendations and reasons why people recommend certain anime. Use this context to make better recommendations.

Analyze the user's prompt and the list of available anime with their recommendation contexts. The list includes:
- Anime titles and IDs
- Real user recommendation reasons
- Related anime that people often recommend together

User's Request:
"{{{prompt}}}"

Available Anime Catalog with Recommendation Context (JSON):
\`\`\`json
{{{animeList}}}
\`\`\`

Based on the user's request, select the single best anime from the catalog. Your selection MUST come from the provided list. Use the recommendation reasons and related anime context to make a more informed choice. Provide a brief, friendly, and compelling reason for your recommendation that incorporates the community insights.

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
    // Fetch anime recommendations data using the centralized service
    const animeList = await getRecommendationsForAI(2); // Fetch 2 pages for variety
    const animeListJson = JSON.stringify(animeList);

    const { output } = await prompt({
      prompt: input.prompt,
      animeList: animeListJson,
    });

    if (!output) {
      throw new Error('Failed to generate anime recommendation');
    }

    return output;
  }
);
