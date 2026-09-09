import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
    if (!body.name && !body.phone && !body.email) return NextResponse.json({ ok: false, error: 'Lead requires name, phone, or email' }, { status: 400 });
    return NextResponse.json({ ok: true, received: true, event: 'lead', demo: true, message: 'Lead payload validated. Database persistence is not configured.' });
  } catch { return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 }); }
}