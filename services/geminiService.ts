import { GoogleGenAI } from "@google/genai";
import { GithubRepo } from "../types.js";

// Lazy-initialize the AI client to avoid crashing if the key is missing at startup
let _ai: any = null;
const getAIClient = () => {
  if (_ai) return _ai;
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!key) {
    throw new Error("Gemini API key is not configured.");
  }
  _ai = new GoogleGenAI({ apiKey: key });
  return _ai;
};

const RATIONALE_MODEL = 'gemini-3-flash-preview';
const THUMBNAIL_MODEL = 'gemini-2.5-flash-image';
const PROFILE_MODEL = 'gemini-3-flash-preview';

/**
 * Generates a "Rationale" or marketing pitch for a repository based on its metadata.
 */
export const generateRepoRationale = async (repo: GithubRepo): Promise<{ rationale: string; model: string }> => {
  try {
    const prompt = `
      You are a tech portfolio expert.
      Write a concise, compelling, 1-sentence "Rationale" (value proposition) for this GitHub project.
      Focus on *why* it is useful or what problem it solves. Use professional but energetic language.
      Do NOT use quotes.
      
      Project Name: ${repo.name}
      Language: ${repo.language || 'Unknown'}
      Topics: ${repo.topics.join(', ') || 'None'}
      Description: ${repo.description || 'No description provided.'}
    `;

    const response = await getAIClient().models.generateContent({
      model: RATIONALE_MODEL,
      contents: prompt,
    });

    return {
      rationale: response.text?.trim() || "Could not generate rationale.",
      model: RATIONALE_MODEL
    };
  } catch (error) {
    console.error("Gemini Rationale Error:", error);
    return { rationale: "AI analysis temporarily unavailable.", model: RATIONALE_MODEL };
  }
};

/**
 * Generates a thumbnail image for the repository.
 */
export const generateRepoThumbnail = async (repo: GithubRepo): Promise<{ imageUrl: string | null; model: string }> => {
  try {
    const prompt = `
      A modern, minimalist, abstract 3D digital art header image for a software project named "${repo.name}".
      Theme: ${repo.language ? repo.language : 'Technology'}, sleek, futuristic, gradient, dark mode aesthetic.
      The image should look like a high-end startup landing page hero background.
      No text in the image.
      Aspect Ratio 16:9.
    `;

    const response = await getAIClient().models.generateContent({
      model: THUMBNAIL_MODEL,
      contents: {
        parts: [{ text: prompt }]
      },
    });

    // Check for inline data (image)
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return {
          imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          model: THUMBNAIL_MODEL
        };
      }
    }
    return { imageUrl: null, model: THUMBNAIL_MODEL };
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return { imageUrl: null, model: THUMBNAIL_MODEL };
  }
};

/**
 * Analyzes the user's profile to generate a "Professional Summary".
 */
export const generateProfileSummary = async (username: string, repos: GithubRepo[]): Promise<string> => {
  try {
    const topRepos = repos.slice(0, 5).map(r => `${r.name} (${r.language})`).join(', ');
    const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))).join(', ');

    const prompt = `
      Analyze this developer profile based on their top repositories: ${topRepos}
      and languages used: ${languages}.
      Write a cool, 2-sentence bio describing their "Developer Persona" (e.g., "Full-Stack Architect," "Frontend Wizard").
      Use emojis.
    `;

    const response = await getAIClient().models.generateContent({
      model: PROFILE_MODEL,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Profile Error:", error);
    return "";
  }
};