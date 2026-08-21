// Product-styled HTML emails: dark panel, gold accents, blocky monospace
// headings. Table layout + inline styles so every mail client renders it.

function layout(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<body style="margin:0;padding:0;background:#17171b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#17171b;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
  <tr><td style="padding:0 0 16px;font-family:'Courier New',monospace;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:2px;">
    Launch<span style="color:#ffd83d;">Bid</span>
  </td></tr>
  <tr><td style="background:#101013;border:2px solid #000;box-shadow:inset 0 0 0 2px rgba(255,255,255,.14);padding:28px;">
    <div style="font-family:'Courier New',monospace;font-size:18px;font-weight:bold;color:#ffd83d;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">${heading}</div>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#e6e6ec;">${bodyHtml}</div>
  </td></tr>
  <tr><td style="padding:16px 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8b8b95;">
    Every token is a bid. Totals never reset. · <a href="https://launchbid.vercel.app" style="color:#8b8b95;">launchbid.vercel.app</a>
  </td></tr>
</table>
</td></tr>
</table>
</body>`;
}

const btn = (href: string, label: string, bg = "#46a32e") =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;font-family:'Courier New',monospace;font-weight:bold;letter-spacing:2px;text-decoration:none;padding:12px 22px;border:2px solid #000;margin:8px 0;">${label}</a>`;

const statRow = (rows: [string, string][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;border:1px solid #2a2a30;">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:13px;color:#9a9aa4;border-bottom:1px solid #2a2a30;">${k}</td><td style="padding:8px 12px;font-family:'Courier New',monospace;font-size:14px;font-weight:bold;color:#ffffff;border-bottom:1px solid #2a2a30;text-align:right;">${v}</td></tr>`
    )
    .join("")}</table>`;

export function purchaseApproveEmail(params: {
  email: string;
  inr: number;
  tokens: number;
  utr: string;
  approveUrl: string;
}): string {
  return layout(
    "Approve a purchase",
    `<p style="margin:0 0 8px;">A buyer says they paid. Check the UPI credit in your bank app, then approve.</p>
${statRow([
      ["Buyer", params.email],
      ["Amount", `₹${params.inr}`],
      ["Tokens", `${params.tokens} ⚡`],
      ["UTR", params.utr],
    ])}
${btn(params.approveUrl, `APPROVE ${params.tokens} ⚡`)}
<p style="margin:8px 0 0;font-size:13px;color:#9a9aa4;">The link is single-use: a second click can never double-credit.</p>`
  );
}

export function purchaseReceivedEmail(params: {
  inr: number;
  tokens: number;
}): string {
  return layout(
    "Payment received",
    `<p style="margin:0 0 8px;">Got it. We're matching your <b>₹${params.inr}</b> payment now.</p>
<p style="margin:0 0 8px;">Your <b style="color:#ffd83d;">${params.tokens} ⚡</b> will land in your balance shortly, and you'll get a confirmation here the moment they do.</p>
<p style="margin:0;font-size:13px;color:#9a9aa4;">Nothing else to do. Keep this email as your receipt.</p>`
  );
}

export function tokensCreditedEmail(params: {
  tokens: number;
  siteUrl: string;
}): string {
  return layout(
    `${params.tokens} ⚡ credited`,
    `<p style="margin:0 0 8px;">Payment confirmed. <b style="color:#ffd83d;">${params.tokens} tokens</b> are in your balance.</p>
<p style="margin:0 0 4px;">Time to take a spot on the board:</p>
${btn(params.siteUrl, "OPEN THE LEADERBOARD")}
<p style="margin:8px 0 0;font-size:13px;color:#9a9aa4;">You'll also get occasional LaunchBid updates at this address.</p>`
  );
}
