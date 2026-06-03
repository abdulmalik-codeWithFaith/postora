import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  // PKCE — TikTok requires it just like Twitter
  const codeVerifier = crypto
    .randomBytes(64)
    .toString("base64url")
    .slice(0, 128); // max 128 chars

  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // Store uid + codeVerifier in state so callback can use it
  const state = Buffer.from(JSON.stringify({ uid, codeVerifier })).toString("base64url");

  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key",            process.env.TIKTOK_CLIENT_KEY!);
  url.searchParams.set("scope",                 "user.info.basic,user.info.profile,user.info.stats");
  url.searchParams.set("response_type",         "code");
  url.searchParams.set("redirect_uri",          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`);
  url.searchParams.set("state",                 state);
  url.searchParams.set("code_challenge",        codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(url.toString());
}