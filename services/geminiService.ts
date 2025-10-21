import { GoogleGenAI } from "@google/genai";
import { TypingSession } from '../types';

// Assume process.env.API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateCodeSnippet(language: string): Promise<string> {
  try {
    const prompt = `Generate a short, 8-12 line code snippet in the ${language} programming language. The code must be a common, practical, and representative example of the language's syntax, suitable for a typing practice website. Do not include any explanation, comments, or markdown formatting like \`\`\`. Only return the raw code itself. The code must not contain any backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const code = response.text.trim();
    // A fallback in case the model still includes markdown fences
    const cleanedCode = code.replace(/^```(?:\w+\n)?/, '').replace(/```$/, '').trim();
    
    if (!cleanedCode) {
        throw new Error("Generated code is empty.");
    }

    return cleanedCode;

  } catch (error) {
    console.error("Error generating code snippet:", error);
    // Provide a fallback snippet on API error
    return `// Could not load challenge for ${language}.
// Please check your API key or network connection.
function fallback() {
  console.log("This is a fallback code snippet.");
}`;
  }
}


export async function analyzeTypingProgress(sessions: TypingSession[]): Promise<string> {
    if (sessions.length < 2) {
        return "Not enough data to analyze. Complete a few more sessions to see your progress analysis.";
    }

    try {
        const prompt = `Act as an expert typing coach. Analyze the following typing practice sessions data. The data is a JSON array with wpm, accuracy, and language.

Data:
${JSON.stringify(sessions.map(s => ({wpm: s.wpm, accuracy: s.accuracy, language: s.language})), null, 2)}

Based on this data, provide a brief, encouraging analysis of the user's progress in 2-4 sentences.
- Identify trends in speed (WPM) and accuracy.
- Mention if there's improvement, decline, or consistency.
- Offer one simple, actionable tip.
- Keep the tone positive and motivational. Format as a single block of text, without markdown.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error analyzing typing progress:", error);
        return "Could not analyze progress at the moment. Please try again later.";
    }
}
