import "server-only";

/** External AI is opt-in and disabled unless an authorized server key is available. */
export function aiEnabled() {
  return process.env.SKILLMETRY_AI_ENABLED === "true" && Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateStructuredAI(system: string, prompt: string): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!aiEnabled() || !key) throw new Error("ai_unavailable");
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  if (!/^[a-zA-Z0-9.-]{1,64}$/.test(model)) throw new Error("ai_invalid_model");
  // Never accept external target URLs or model names from student input.
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.25, maxOutputTokens: 1600 }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    }
  );
  if (!response.ok) throw new Error("ai_provider_unavailable");
  const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const value = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!value || value.length > 18000) throw new Error("ai_invalid_response");
  return JSON.parse(value) as unknown;
}
