import { NextRequest, NextResponse } from "next/server";
import { saveConnectedAccount } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const base  = process.env.NEXT_PUBLIC_BASE_URL!;
  const code  = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${base}/dashboard/accounts?error=twitter_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${base}/dashboard/accounts?error=twitter_failed`);
  }

  let uid: string;
  let codeVerifier: string;
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
    uid          = parsed.uid;
    codeVerifier = parsed.codeVerifier;
  } catch {
    return NextResponse.redirect(`${base}/dashboard/accounts?error=twitter_failed`);
  }

  try {
    // 1. Exchange code for access token
    const credentials = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        Authorization:   `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${base}/api/auth/twitter/callback`,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    const { access_token } = tokenData;

    // 2. Fetch user profile
    const profileRes = await fetch(
      "https://api.x.com/2/users/me?user.fields=public_metrics,profile_image_url",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const profileData = await profileRes.json();
    const user = profileData?.data ?? {};

    // 3. Save to Firestore
    await saveConnectedAccount(uid, {
      platform:       "Twitter / X",
      handle:         `@${user.username ?? "unknown"}`,
      avatar:         user.name?.slice(0, 2).toUpperCase() ?? "TX",
      followers:      user.public_metrics?.followers_count ?? 0,
      postsPublished: user.public_metrics?.tweet_count     ?? 0,
      lastPost:       "Recently",
      state:          "connected",
      accessToken:    access_token,
    });

    return NextResponse.redirect(`${base}/dashboard/accounts?connected=twitter`);
  } catch (err) {
    console.error("Twitter callback error:", err);
    return NextResponse.redirect(`${base}/dashboard/accounts?error=twitter_failed`);
  }
}