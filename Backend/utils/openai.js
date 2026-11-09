import "dotenv/config";

// Sends the conversation to Groq (OpenAI-compatible API) and returns the reply text.
const getOpenAIAPIResponse = async (messages) => {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set on the server.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
body: JSON.stringify({
  model: "openai/gpt-oss-20b",
  messages,
}),
});

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `LLM request failed (${response.status})`);
  }
  return data?.choices?.[0]?.message?.content || "No response text generated.";
};

export default getOpenAIAPIResponse;
