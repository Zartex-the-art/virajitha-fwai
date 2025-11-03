import { GoogleGenAI, Type } from "@google/genai";
import { Article, GeneratedPost } from '../types.ts';

interface ContentIdea {
    idea: string;
    caption: string;
    imagePrompt: string;
}

// Helper function to get the AI client.
// This should be called right before an API call to ensure the latest key is used.
const getAiClient = () => {
    // The window.aistudio flow populates process.env.API_KEY.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This error will be caught by the calling function's try/catch block.
        throw new Error("API key not found. Please select your API key in the application.");
    }
    return new GoogleGenAI({ apiKey });
};


/**
 * Generates viral post ideas, captions, and images based on news articles.
 * @param articles - An array of news articles.
 * @param industry - The industry context.
 * @returns A promise that resolves to an array of GeneratedPost objects.
 */
export const generateViralContent = async (articles: Article[], industry: string): Promise<GeneratedPost[]> => {
    try {
        const ideasAndCaptions = await generateIdeasAndCaptions(articles, industry);
        
        const imagePromises = ideasAndCaptions.map(idea => 
            generateImageForIdea(idea.imagePrompt)
                .catch(e => {
                    console.error("Image generation failed for prompt:", idea.imagePrompt, e);
                    // Return a placeholder or default image URL on failure
                    return `https://picsum.photos/seed/${idea.idea.replace(/\s+/g, '-')}/512`;
                })
        );
        const imageUrls = await Promise.all(imagePromises);

        return ideasAndCaptions.map((content, index) => ({
            id: crypto.randomUUID(),
            idea: content.idea,
            caption: content.caption,
            imageUrl: imageUrls[index],
        }));

    } catch (error) {
        console.error("Error in generateViralContent:", error);
        // Re-throw the original error to allow the UI to display a specific message
        throw error;
    }
};

const generateIdeasAndCaptions = async (articles: Article[], industry: string): Promise<ContentIdea[]> => {
    const ai = getAiClient();
    const articlesString = articles.map(a => `- ${a.title}: ${a.description}`).join('\n');
    
    const prompt = `
        You are a viral social media marketing expert specializing in the ${industry} industry.
        Based on the following top 10 news articles, generate 10 unique, viral Instagram post concepts.

        For each concept, provide:
        1. "idea": A short, catchy title for the concept.
        2. "caption": A compelling Instagram caption (100-150 words). Make it informative and engaging, ending with a question. Include 3-5 relevant hashtags.
        3. "imagePrompt": A detailed prompt for an AI image generator to create a visually stunning image. The prompt MUST include a specific, short, powerful text phrase to be overlaid on the image in a clear, modern, and highly readable font. The aesthetic should be professional and eye-catching.

        News Articles:
        ${articlesString}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        idea: { type: Type.STRING },
                        caption: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                    },
                    required: ['idea', 'caption', 'imagePrompt'],
                },
            },
        },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("Received an empty response from Gemini for content ideas.");
    }

    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", jsonText);
        throw new Error("Could not parse the AI's response for content ideas.");
    }
};

const generateImageForIdea = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
            outputMimeType: 'image/jpeg',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
        throw new Error("Image generation failed, no images returned.");
    }
};