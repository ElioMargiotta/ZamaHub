import { NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';

export async function POST(request) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json({ error: 'Missing message or signature' }, { status: 400 });
    }

    const siweMessage = new SiweMessage(message);
    const verification = await siweMessage.verify({ signature });

    if (!verification.success) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Here you can set session or return success
    return NextResponse.json({ success: true, address: siweMessage.address });
  } catch (e) {
    console.error('Verification error:', e);
    return NextResponse.json({ error: 'Failed to verify', detail: e.message }, { status: 500 });
  }
}