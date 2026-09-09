import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
    if (!body.message && !body.text && !body.body) return NextResponse.json({ ok: false, error: 'Message content is required' }, { status: 400 });
    return NextResponse.json({ ok: true, received: true, event: 'message', demo: true, handoff: false, message: 'Message payload validated. Configure n8n/messaging before sending or storing messages.' });
  } catch { return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 }); }
}