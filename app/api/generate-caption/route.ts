import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform = "Instagram" | "TikTok" | "Facebook";
type Tone     = "professional" | "fun" | "inspirational" | "promotional";

interface RequestBody {
  tone:         Tone;
  platforms:    Platform[];
  mediaName?:   string;
  mediaUrl?:    string;
  context?:     string;
  businessName?: string;
}

interface CaptionResult {
  platform:  Platform;
  text:      string;
  hashtags:  string[];
}

// ─── Platform-specific character limits and tips ──────────────────────────────
const PLATFORM_RULES: Record<Platform, string> = {
  Instagram: "Max 2200 characters. Use 5–10 hashtags. Include a call-to-action and 'link in bio'.",
  TikTok:    "Max 2200 characters. Keep it short, punchy and energetic. Use trending phrases. 3–5 hashtags.",
  Facebook:  "Max 500 characters for best reach. Conversational tone. 1–3 hashtags or none.",
};

// ─── Tone descriptions ────────────────────────────────────────────────────────
const TONE_PROMPTS: Record<Tone, string> = {
  professional:  "Write in a professional, polished, and trustworthy tone. Use clean language and focus on quality and value.",
  fun:           "Write in a fun, playful, casual and energetic tone. Use emojis, excitement, and relatable language. Feel free to use caps for emphasis.",
  inspirational: "Write in a warm, motivating and inspirational tone. Connect the product to personal growth, confidence or lifestyle.",
  promotional:   "Write in a sales-focused, urgent promotional tone. Highlight limited stock, deals, or strong calls to action. Create urgency.",
};

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { tone, platforms, mediaName, context, businessName } = body;

    // ── Validate ────────────────────────────────────────────────────────────
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: "At least one platform required" }, { status: 400 });
    }
    if (!tone) {
      return NextResponse.json({ error: "Tone is required" }, { status: 400 });
    }

    // ── Build prompt ────────────────────────────────────────────────────────
    const platformInstructions = platforms
      .map((p) => `- ${p}: ${PLATFORM_RULES[p]}`)
      .join("\n");

    const prompt = `
You are a professional social media content writer for a Nigerian e-commerce/product business called "${businessName ?? "the brand"}".

Your task is to write social media captions for the following platforms: ${platforms.join(", ")}.

PRODUCT/MEDIA: ${mediaName ?? "a product"}
${context ? `ADDITIONAL CONTEXT: ${context}` : ""}

TONE: ${TONE_PROMPTS[tone]}

PLATFORM RULES:
${platformInstructions}

IMPORTANT INSTRUCTIONS:
- Write one caption per platform
- Each caption must feel native to that platform
- Include relevant hashtags separately (not inside the caption text)
- For Nigerian market context where relevant (₦ currency, Nigerian culture, Lagos lifestyle etc.)
- Do NOT include the platform name inside the caption
- Do NOT use quotation marks around the caption text

Respond ONLY with valid JSON in this exact format, no markdown, no explanation:
{
  "captions": [
    {
      "platform": "Instagram",
      "text": "caption text here",
      "hashtags": ["#tag1", "#tag2", "#tag3"]
    }
  ]
}
`.trim();

    // ── Call Gemini ─────────────────────────────────────────────────────────
    const model  = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const raw    = result.response.text().trim();

    // ── Parse response ──────────────────────────────────────────────────────
    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed: { captions: CaptionResult[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Gemini raw response:", raw);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // ── Validate structure ──────────────────────────────────────────────────
    if (!parsed.captions || !Array.isArray(parsed.captions)) {
      return NextResponse.json({ error: "Invalid AI response structure" }, { status: 500 });
    }

    // ── Filter to only requested platforms ──────────────────────────────────
    const filtered = parsed.captions.filter((c) =>
      platforms.includes(c.platform as Platform)
    );

    return NextResponse.json({ captions: filtered }, { status: 200 });

  } catch (err: unknown) {
    console.error("Caption generation error:", err);

    const message = err instanceof Error ? err.message : "Internal server error";

    // Handle Gemini quota / auth errors specifically
    if (message.includes("API_KEY")) {
      return NextResponse.json({ error: "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local" }, { status: 500 });
    }
    if (message.includes("quota") || message.includes("429")) {
      return NextResponse.json({ error: "Gemini quota exceeded. Try again later." }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}