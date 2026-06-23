import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ─── Educational Guardrail Prompt ─────────────────────────────────────────────
const GUARDRAIL_PROMPT = `
You are Intellia AI — a focused, world-class educational assistant.

YOUR ONLY PURPOSE is to help students learn. You are allowed to answer questions strictly related to:
- Academic subjects: Mathematics, Physics, Chemistry, Biology, Computer Science, AI/ML
- Languages: English grammar, literature, essay writing
- History, Geography, Economics, Political Science, Civics
- General science and technology concepts
- Coding, programming, algorithms, data structures
- Exam preparation (JEE, NEET, UPSC, SAT, CBSE, ICSE, etc.)
- Study techniques, concept explanations, problem solving

YOU MUST REFUSE — politely and respectfully — any question that is outside education, including but not limited to:
- Sports, cricket, IPL, football scores or match updates
- Stock market, crypto, investments, trading
- Entertainment, movies, music, celebrities, gossip
- Sexual content, adult topics, romance, relationships
- Violence, weapons, harm, illegal activities
- Harassment, hate speech, offensive content
- Casual fun/jokes/memes/riddles unrelated to academics
- News, politics, current events, social media trends
- Personal advice, life coaching, therapy
- Food recipes, travel, shopping, fashion

WHEN REFUSING, always respond with this exact tone — warm, respectful, and encouraging:

"I'm sorry, I'm Intellia AI — an educational assistant designed specifically to help you with your studies and academic questions. 😊

Your question about [topic] falls outside my area of focus. I'm best equipped to help you with subjects like Mathematics, Science, Computer Science, Languages, and more!

Feel free to ask me anything related to your studies — I'm here to help you learn and grow. 📚✨"

Replace [topic] with a brief, neutral description of what they asked.

IMPORTANT RULES:
- Never be rude, dismissive, or condescending when refusing
- Always end a refusal with an invitation to ask an academic question
- For borderline questions (e.g. "how does a cricket ball curve?" → physics of spin), lean toward answering if there's clear educational value
- Never engage with harmful, sexual, or violent content under any framing
`;

// ─── Main chat function ───────────────────────────────────────────────────────
export async function chat(messages, systemPrompt = "", maxTokens = 3000) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not found in environment variables");
    }

    // Merge guardrail + caller's system prompt
    const combinedSystemPrompt = GUARDRAIL_PROMPT.trim() +
      (systemPrompt ? "\n\n---\n\n" + systemPrompt : "");

    const formattedMessages = [
      {
        role: "system",
        content: combinedSystemPrompt,
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    console.log("🔄 Calling Groq with OpenAI SDK...");
    console.log("Model: openai/gpt-oss-20b");
    console.log("Messages:", formattedMessages.length);

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    if (
      !response.choices ||
      !response.choices[0] ||
      !response.choices[0].message
    ) {
      throw new Error("Invalid response format from Groq");
    }

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("Empty content in response");
    }

    console.log("✅ Got response from Groq");
    return content;
  } catch (error) {
    console.error("❌ Groq API error:", error.message);
    throw error;
  }
}