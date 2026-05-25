import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // true for port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  const { email, name, verificationLink } = await req.json();

  if (!email || !verificationLink) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Welcome! Please verify your email",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0a0e14;color:#e2e8f0;border-radius:16px;">
          <h2 style="color:#00C98D;margin-bottom:8px;">Welcome${name ? `, ${name}` : ""}! 🎉</h2>
          <p style="color:#94a3b8;margin-bottom:24px;">
            Thanks for signing up. Click the button below to verify your email address and activate your account.
          </p>
          <a href="${verificationLink}"
            style="display:inline-block;padding:12px 28px;background:#00C98D;color:#0a0e14;font-weight:600;border-radius:10px;text-decoration:none;">
            Verify Email
          </a>
          <p style="margin-top:24px;font-size:13px;color:#64748b;">
            If you didn't create an account, you can safely ignore this email.<br/>
            This link expires in 24 hours.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}