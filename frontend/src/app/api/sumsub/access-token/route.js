import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { SiweMessage } from 'siwe';

export async function POST(request) {
  try {
    const { userId, levelName = 'id-and-liveness', ttlInSecs = 600, message, signature } = await request.json();

    if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_APP_SECRET) {
      return NextResponse.json({ error: 'Missing SUMSUB_APP_TOKEN/SECRET' }, { status: 500 });
    }

    // Verify SIWE signature to prove address ownership
    if (!message || !signature) {
      return NextResponse.json({ error: 'Missing message or signature for SIWE verification' }, { status: 400 });
    }

    const siweMessage = new SiweMessage(message);
    const verification = await siweMessage.verify({ signature });

    if (!verification.success) {
      return NextResponse.json({ error: 'Invalid SIWE signature' }, { status: 401 });
    }

    // Check if the verified address matches the userId
    if (siweMessage.address.toLowerCase() !== userId.toLowerCase()) {
      return NextResponse.json({ error: 'Address mismatch' }, { status: 401 });
    }

    const ts = Math.floor(Date.now() / 1000).toString();
    const method = 'POST';
    const path = '/resources/accessTokens/sdk';

    const bodyObj = { userId, levelName, ttlInSecs };
    const body = JSON.stringify(bodyObj);

    // X-App-Access-Sig = HMAC_SHA256(ts + method + path + body)
    const sigPayload = ts + method + path + body;
    const sig = crypto.createHmac('sha256', process.env.SUMSUB_APP_SECRET)
                      .update(sigPayload)
                      .digest('hex');

    const resp = await fetch('https://api.sumsub.com' + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Token': process.env.SUMSUB_APP_TOKEN,
        'X-App-Access-Ts': ts,
        'X-App-Access-Sig': sig,
      },
      body,
      cache: 'no-store',
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error('Sumsub token response:', resp.status, text);
      return new Response(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'text/plain' } });
    }

    return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Sumsub API error:', e);
    return NextResponse.json({ error: 'Failed to generate access token', detail: e.message }, { status: 500 });
  }
}