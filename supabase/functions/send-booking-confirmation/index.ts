// @ts-nocheck
// ============================================================
// Supabase Edge Function: send-booking-confirmation
// Uses Gmail SMTP — no custom domain required.
//
// Deploy:
//   supabase functions deploy send-booking-confirmation
//
// Required secrets (set via CLI or Supabase Dashboard):
//   GMAIL_USER         — your Gmail address e.g. yourname@gmail.com
//   GMAIL_APP_PASSWORD — 16-char Gmail App Password (NOT your Gmail login password)
//
// How to get a Gmail App Password:
//   1. Enable 2-Step Verification on your Google account
//   2. Go to https://myaccount.google.com/apppasswords
//   3. Create a new app password → name it "VELS Turf"
//   4. Copy the 16-character password (no spaces)
//
// The Gmail credentials are NEVER sent to the browser.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

// ── CORS headers ─────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Helper: structured JSON response ─────────────────────────
function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ── Main handler ──────────────────────────────────────────────
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Parse request body ──────────────────────────────────
  let payload: {
    name: string;
    email: string;
    registrationNo: string;
    date: string;       // DD/MM/YYYY
    startTime: string;  // HH:MM
    endTime: string;    // HH:MM
    bookingId: string;
  };

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
  }

  const { name, email, registrationNo, date, startTime, endTime, bookingId } = payload;

  // ── 2. Validate required fields ────────────────────────────
  if (!name || !email || !registrationNo || !date || !startTime || !endTime || !bookingId) {
    return jsonResponse({ error: 'Missing required fields in request body' }, 400);
  }

  // ── 3. Read Gmail secrets ──────────────────────────────────
  const GMAIL_USER = Deno.env.get('GMAIL_USER');
  const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error(
      '[send-booking-confirmation] GMAIL_USER or GMAIL_APP_PASSWORD secret is not set.',
    );
    return jsonResponse(
      { error: 'Email service is not configured. Please contact the administrator.' },
      503,
    );
  }

  // ── 4. Build plain-text email body ────────────────────────
  const emailText = [
    `Hello ${name},`,
    '',
    'Your Turf booking has been successfully confirmed.',
    '',
    'BOOKING DETAILS',
    `Booking ID: ${bookingId}`,
    `Registration Number: ${registrationNo}`,
    `Date: ${date}`,
    `Time: ${startTime} - ${endTime}`,
    `Facility: Turf`,
    `Floor: 13`,
    '',
    'BOOKING CONFIRMED',
    'Your turf slot has been reserved successfully.',
    '',
    'Please keep this email for your reference.',
    '',
    'Regards,',
    'VELS High Tech Campus',
  ].join('\n');

  // ── 4b. Build HTML email body ──────────────────────────────
  // ── 4b. Build HTML email body ──────────────────────────────
  const rawEmailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VELS Turf Booking Confirmation</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; color: #f3efe4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 20px 10px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0c0019; border: 1px solid #2a271f; border-radius: 14px; overflow: hidden; margin: 0 auto;">
            <tr>
              <td style="background-color: #150245; padding: 30px 20px; text-align: center; border-bottom: 2px solid #cfa13a;">
                <h1 style="margin: 0; color: #edb715; font-size: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">VELS High Tech Campus</h1>
                <p style="margin: 10px 0 0 0; color: #f3efe4; font-size: 18px; letter-spacing: 2px;">TURF BOOKING</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 20px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #f3efe4;">Hello <strong>${name}</strong>,</p>
                <p style="margin: 0 0 30px 0; font-size: 16px; color: #c9c2b3;">Your Turf booking has been successfully confirmed.</p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; border: 1px solid #2a271f; border-radius: 8px; padding: 20px;">
                  <tr>
                    <td colspan="2" style="padding-bottom: 15px; border-bottom: 1px solid #2a271f;">
                      <h2 style="margin: 0; color: #e8c15f; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0 5px 0; color: #8b8579; font-size: 12px; text-transform: uppercase;">Booking ID</td>
                    <td style="padding: 15px 0 5px 0; color: #8b8579; font-size: 12px; text-transform: uppercase;">Registration Number</td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 15px 0; color: #f3efe4; font-size: 14px; font-family: monospace;">${bookingId}</td>
                    <td style="padding: 0 0 15px 0; color: #edb715; font-size: 16px; font-weight: bold;">${registrationNo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #8b8579; font-size: 12px; text-transform: uppercase;">Date</td>
                    <td style="padding: 5px 0; color: #8b8579; font-size: 12px; text-transform: uppercase;">Time</td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 15px 0; color: #f3efe4; font-size: 16px;"><strong>${date}</strong></td>
                    <td style="padding: 0 0 15px 0; color: #f3efe4; font-size: 16px;"><strong>${startTime} - ${endTime}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #8b8579; font-size: 12px; text-transform: uppercase;">Facility</td>
                    <td style="padding: 5px 0; color: #8b8579; font-size: 12px; text-transform: uppercase;">Floor</td>
                  </tr>
                  <tr>
                    <td style="padding: 0; color: #f3efe4; font-size: 16px;">Turf</td>
                    <td style="padding: 0; color: #f3efe4; font-size: 16px;">13</td>
                  </tr>
                </table>
                <div style="margin-top: 30px; padding: 15px; background-color: rgba(207, 161, 58, 0.1); border-left: 4px solid #cfa13a; border-radius: 4px;">
                  <h3 style="margin: 0 0 5px 0; color: #edb715; font-size: 16px;">Booking Confirmed</h3>
                  <p style="margin: 0; color: #c9c2b3; font-size: 14px;">Your turf slot has been reserved successfully.</p>
                </div>
                <p style="margin: 30px 0 0 0; font-size: 14px; color: #8b8579; text-align: center;">Please keep this email for your reference.</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #2a271f;">
                <p style="margin: 0; color: #8b8579; font-size: 14px;">Regards,<br><strong style="color: #c9c2b3;">VELS High Tech Campus</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  
  // Minify HTML to prevent quoted-printable encoding artifacts (=20) caused by newlines/spaces
  const emailHtml = rawEmailHtml.replace(/[\r\n]+/g, '').replace(/\s{2,}/g, ' ').trim();

  // ── 5. Send via Gmail SMTP (TLS on port 465) ──────────────
  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 465,
      tls: true,
      auth: {
        username: GMAIL_USER,
        password: GMAIL_APP_PASSWORD,
      },
    },
  });

  try {
    await client.send({
      from: `VELS Turf <${GMAIL_USER}>`,
      to: email,
      subject: 'VELS Turf Booking Confirmation',
      content: emailText,
      html: emailHtml,
    });

    await client.close();

    console.log(
      `[send-booking-confirmation] Email sent successfully to ${email} for booking ${bookingId}.`,
    );

    return jsonResponse({ success: true, bookingId, emailSentTo: email });

  } catch (smtpErr) {
    // Close the connection if it was opened
    try { await client.close(); } catch { /* ignore */ }

    const msg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
    console.error(`[send-booking-confirmation] Gmail SMTP error:`, msg);

    // Distinguish common Gmail errors with helpful messages
    let friendlyError = 'Could not send confirmation email. Gmail SMTP error.';
    if (msg.includes('535') || msg.includes('Username and Password') || msg.includes('auth')) {
      friendlyError = 'Gmail authentication failed. Check GMAIL_USER and GMAIL_APP_PASSWORD secrets.';
    } else if (msg.includes('timeout') || msg.includes('connect')) {
      friendlyError = 'Could not connect to Gmail SMTP. Network or firewall issue.';
    }

    return jsonResponse({ error: friendlyError, detail: msg }, 502);
  }
});
