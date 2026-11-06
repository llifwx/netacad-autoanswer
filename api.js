const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

function buildGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

async function getProviderConfig() {
  const stored = await chrome.storage.sync.get(["geminiApiKey", "geminiModel"]);
  return {
    apiKey: stored.geminiApiKey || "",
    model: stored.geminiModel || DEFAULT_GEMINI_MODEL,
  };
}

async function getAiAnswer(question, answers, apiKey) {
  const cfg = await getProviderConfig();
  const effectiveKey = apiKey || cfg.apiKey;
  if (!effectiveKey) {
    return "Error: Gemini API Key not available. Please set it in the extension popup.";
  }

  let prompt = `Given the following multiple-choice question and its possible answers, please choose the best answer(s).
If the question implies multiple correct answers (e.g., 'select all that apply', 'choose N correct options'), return ALL chosen answer texts, each on a new line.
Otherwise, if it's a single-choice question, return only the text of the single best chosen answer option.
Do not add any extra explanation or leading text like "The best answer is: ".

Question:
${question}

Possible Answers:
`;
  answers.forEach((ans, i) => {
    prompt += `${i + 1}. ${ans}\n`;
  });

  try {
    const response = await fetch(buildGeminiUrl(cfg.model), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": effectiveKey,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      return `Error calling Gemini API: ${response.status} ${response.statusText}.`;
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Unexpected Gemini response:", data);
      return "Error: Could not extract answer from Gemini response.";
    }
    return text.trim();
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return "Error connecting to Gemini API. Check console.";
  }
}
