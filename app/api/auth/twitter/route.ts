import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  // PKCE — Twitter OAuth 2.0 requires it
  const codeVerifier  = crypto.randomBytes(64).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = Buffer.from(JSON.stringify({ uid, codeVerifier })).toString("base64url");

  const url = new URL("https://x.com/i/oauth2/authorize");
  url.searchParams.set("response_type",          "code");
  url.searchParams.set("client_id",              process.env.TWITTER_CLIENT_ID!);
  url.searchParams.set("redirect_uri",           `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/callback`);
  url.searchParams.set("scope",                  "tweet.read tweet.write users.read offline.access");
  url.searchParams.set("state",                  state);
  url.searchParams.set("code_challenge",         codeChallenge);
  url.searchParams.set("code_challenge_method",  "S256");

  return NextResponse.redirect(url.toString());
}