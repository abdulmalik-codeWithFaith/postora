import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  // Encode uid in state so we get it back in the callback
  const state = Buffer.from(JSON.stringify({ uid })).toString("base64url");

  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key",     process.env.TIKTOK_CLIENT_KEY!);
  url.searchParams.set("scope",          "user.info.basic,user.info.profile,user.info.stats");
  url.searchParams.set("response_type",  "code");
  url.searchParams.set("redirect_uri",   `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`);
  url.searchParams.set("state",          state);

  return NextResponse.redirect(url.toString());
}