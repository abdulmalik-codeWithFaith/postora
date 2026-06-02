import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const state = Buffer.from(JSON.stringify({ uid })).toString("base64");

  const url = new URL("https://api.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", process.env.INSTAGRAM_CLIENT_ID!);
  url.searchParams.set("redirect_uri", `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/instagram/callback`);
  url.searchParams.set("scope", "user_profile,user_media");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString());
}