// Supabase Edge Function: send-booking-email
// Deploy with: supabase functions deploy send-booking-email
//
// Required environment secrets (set via Supabase Dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY  — your Resend.com API key (https://resend.com)
//   FROM_EMAIL      — sender address e.g. "VISTAS Turf <noreply@yourdomain.com>"
//
// This function is invoked from the React frontend using supabase.functions.invoke()
// The service-role key is NEVER exposed to the frontend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, registrationNo, date, startTime, endTime, bookingId } = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'VISTAS Turf <noreply@vistas.ac.in>';

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailBody = `
Hello ${name},

Your VELS High Tech Campus Turf booking has been confirmed.

Registration No: ${registrationNo}
Date: ${date}
Time: ${startTime} - ${endTime}
Facility: VELAS High Tech Campus Turf
Floor: 13

Booking ID: ${bookingId}

Please keep this email for your reference.

Regards,
VELAS High Tech Campus
    `.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'VELAS Turf Booking Confirmation',
        text: emailBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: 'Email send failed', detail: errText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
