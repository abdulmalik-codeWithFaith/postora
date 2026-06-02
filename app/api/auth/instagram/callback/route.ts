import { NextRequest, NextResponse } from "next/server";
import { saveConnectedAccount } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const { uid } = JSON.parse(Buffer.from(state!, "base64").toString());

  // 1. Exchange code for access token
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id:     process.env.INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      grant_type:    "authorization_code",
      redirect_uri:  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/instagram/callback`,
      code:          code!,
    }),
  });
  const { access_token, user_id } = await tokenRes.json();

  // 2. Fetch profile info
  const profileRes = await fetch(
    `https://graph.instagram.com/${user_id}?fields=username,followers_count,media_count&access_token=${access_token}`
  );
  const profile = await profileRes.json();

  // 3. Save to Firestore (your existing function)
  await saveConnectedAccount(uid, {
    platform:       "Instagram",
    handle:         `@${profile.username}`,
    avatar:         profile.username.slice(0, 2).toUpperCase(),
    followers:      profile.followers_count ?? 0,
    postsPublished: profile.media_count ?? 0,
    lastPost:       "Recently",
    state:          "connected",
    accessToken:    access_token, // store encrypted in prod
  });

  // 4. Redirect back to your accounts page
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/accounts?connected=instagram`);
}