import nodemailer from "nodemailer";

// Same pattern as pagehaul: all mail goes through the owner's Gmail via SMTP.
export function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  });
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ error?: string }> {
  try {
    await getTransport().sendMail({
      from: `LaunchBid <${process.env.GMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "mail failed" };
  }
}
