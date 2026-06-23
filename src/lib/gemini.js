import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const callGeminiAPI = async ({
  systemPrompt,
  messages,
  maxTokens = 2048,
  temperature = 0.4,
}) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Build the contents array for the API
    const contents = [];

    // Add system prompt as first user message if provided
    if (systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
      // Add acknowledgment from model
      contents.push({
        role: "model",
        parts: [{ text: "Understood. I will follow your instructions." }],
      });
    }
 
    // Add conversation history
    if (messages && messages.length > 0) {
      messages.forEach((msg) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });
    }

    // If no system prompt and no messages, just add the prompt
    if (!systemPrompt && (!messages || messages.length === 0)) {
      throw new Error("No content provided for API call");
    }

    const requestBody = {
      contents: contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
    };

    console.log("Sending request to Gemini API...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error Response:", errorData);
      throw new Error(
        errorData.error?.message || `API error ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Gemini API Response received");

    // Extract text from response
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log("Successfully extracted response text");
      return responseText;
    }

    console.error("Unexpected response format:", data);
    throw new Error("Unexpected response format from Gemini API");
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
};