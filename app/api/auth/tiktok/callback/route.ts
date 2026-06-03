import { NextRequest, NextResponse } from "next/server";
import { saveConnectedAccount } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const base  = process.env.NEXT_PUBLIC_BASE_URL!;
  const code  = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${base}/dashboard/accounts?error=tiktok_denied`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${base}/dashboard/accounts?error=tiktok_failed`);
  }

  let uid: string;
  let codeVerifier: string;
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
    uid          = parsed.uid;
    codeVerifier = parsed.codeVerifier;
  } catch {
    return NextResponse.redirect(`${base}/dashboard/accounts?error=tiktok_failed`);
  }

  try {
    // 1. Exchange code for token — now includes code_verifier
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: new URLSearchParams({
        client_key:    process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type:    "authorization_code",
        redirect_uri:  `${base}/api/auth/tiktok/callback`,
        code_verifier: codeVerifier, // ← this was missing before
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error(JSON.stringify(tokenData));

    const { access_token, open_id } = tokenData;

    // 2. Fetch user profile
    const profileRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url,follower_count,video_count",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const profileData = await profileRes.json();
    const tikUser = profileData?.data?.user ?? {};

    // 3. Save to Firestore
    await saveConnectedAccount(uid, {
      platform:       "TikTok",
      handle:         `@${tikUser.display_name ?? open_id}`,
      avatar:         tikUser.display_name?.slice(0, 2).toUpperCase() ?? "TK",
      followers:      tikUser.follower_count ?? 0,
      postsPublished: tikUser.video_count    ?? 0,
      lastPost:       "Recently",
      state:          "connected",
      accessToken:    access_token,
    });

    return NextResponse.redirect(`${base}/dashboard/accounts?connected=tiktok`);
  } catch (err) {
    console.error("TikTok callback error:", err);
    return NextResponse.redirect(`${base}/dashboard/accounts?error=tiktok_failed`);
  }
}