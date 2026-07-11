import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";



const FREQUENCY_TO_COUNT: Record<string, number> = {
  light: 12,     // ~2-3 / week
  standard: 20,  // ~4-5 / week
  daily: 30,
};

export async function POST(req: NextRequest) {
  let campaignId: string | undefined;

  try {
    const body = await req.json();
    campaignId = body.campaignId;
    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    const campaignRef = adminDb.collection("campaigns").doc(campaignId);
    const campaignSnap = await campaignRef.get();
    if (!campaignSnap.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    const campaign = campaignSnap.data()!;
    const uid = campaign.userId;

    // ── Gather context for generation ────────────────────────────────────
    const [profileSnap, mediaSnaps] = await Promise.all([
      adminDb.collection("businessProfiles").doc(uid).get(),
      Promise.all(
        (campaign.mediaIds as string[]).map((id: string) => adminDb.collection("media").doc(id).get())
      ),
    ]);

    const profile = profileSnap.exists ? profileSnap.data()! : {};
    const media = mediaSnaps
      .filter((s) => s.exists)
      .map((s) => ({ id: s.id, ...s.data() } as Record<string, unknown>));

    if (media.length === 0) {
      await campaignRef.update({ status: "failed", error: "No media found for this campaign." });
      return NextResponse.json({ error: "No media found" }, { status: 400 });
    }

    const postCount = FREQUENCY_TO_COUNT[campaign.frequency] ?? 12;

    const generatedPosts: { dayOffset: number; mediaId: string; caption: string }[] =
      await generateMonthlyPlan({ profile, media, postCount, campaign });

    // ── Write one `posts` doc per generated entry ────────────────────────
    const batch = adminDb.batch();
    const today = new Date();

    for (const entry of generatedPosts) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + entry.dayOffset);
      scheduledDate.setHours(9, 0, 0, 0); // default 9am — adjust if you want time-of-day variety

      const matchedMedia = media.find((m) => m.id === entry.mediaId);

      const postRef = adminDb.collection("posts").doc();
      batch.set(postRef, {
        userId: uid,
        campaignId,
        caption: entry.caption,
        mediaUrl: matchedMedia?.cloudinaryUrl ?? null,
        platforms: campaign.testMode ? ["Instagram"] : [], // TODO: map campaign.accountIds -> platform names once accounts exist
        status: "scheduled",
        scheduledAt: scheduledDate.toISOString(),
        publishedAt: null,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    await campaignRef.update({ status: "complete", completedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ ok: true, postsCreated: generatedPosts.length });
  } catch (err) {
    console.error("Campaign generation failed:", err);
    if (campaignId) {
      await adminDb.collection("campaigns").doc(campaignId).update({
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error during generation",
      }).catch(() => {}); // don't let a logging failure mask the original error
    }
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const responseSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      dayOffset: { type: SchemaType.INTEGER, description: "Days from today this post should go out (0 = today)" },
      mediaId:   { type: SchemaType.STRING,  description: "Must exactly match one of the provided media IDs" },
      caption:   { type: SchemaType.STRING,  description: "Full caption text including hashtags at the end" },
    },
    required: ["dayOffset", "mediaId", "caption"],
  },
};

async function generateMonthlyPlan({
  profile, media, postCount, campaign,
}: {
  profile: Record<string, unknown>;
  media: Record<string, unknown>[];
  postCount: number;
  campaign: Record<string, unknown>;
}): Promise<{ dayOffset: number; mediaId: string; caption: string }[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }

  const businessName = (profile.businessName as string) ?? "the business";
  const industry      = (profile.industry as string) ?? "";
  const tone           = (profile.tone as string) ?? (profile.brandVoice as string) ?? "friendly and professional";
  const description    = (profile.description as string) ?? "";
  const seasonal        = campaign.seasonal as { theme: string } | null;

  const mediaList = media
    .map((m) => `- id: "${m.id}", name: "${m.name ?? "untitled"}", type: ${m.type ?? "image"}`)
    .join("\n");

  const prompt = `
You are a social media marketing assistant creating a ${postCount}-post monthly content calendar for a business.

Business name: ${businessName}
Industry: ${industry || "not specified"}
Brand voice/tone: ${tone}
${description ? `Description: ${description}` : ""}
Campaign goal: ${campaign.goal}
${seasonal ? `Seasonal theme to weave in: ${seasonal.theme}` : "No specific seasonal theme — keep it evergreen."}

Available media to choose from (pick the best fit for each post — reuse media if there are fewer files than posts, but vary the pairing across the month):
${mediaList}

Generate exactly ${postCount} posts spread across a 30-day month (dayOffset 0–29, spaced out sensibly rather than clustered). For each post:
- Pick the mediaId that best fits the day's theme/goal
- Write a caption in the specified brand voice, appropriate for Instagram, ending with 3-6 relevant hashtags
- Vary the captions across the month — don't repeat the same structure or opening line

Return ONLY the JSON array matching the required schema — no extra commentary.
`.trim();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed: { dayOffset: number; mediaId: string; caption: string }[];
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned malformed JSON — could not parse the generated calendar.");
  }

  
  const validIds = new Set(media.map((m) => m.id as string));
  return parsed.map((entry, i) => ({
    ...entry,
    mediaId: validIds.has(entry.mediaId) ? entry.mediaId : (media[i % media.length].id as string),
  }));
}