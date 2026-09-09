import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
    if (!body.patient_id && !body.patientId && !body.phone && !body.email) return NextResponse.json({ ok: false, error: 'Appointment requires a patient identifier' }, { status: 400 });
    return NextResponse.json({ ok: true, received: true, event: 'appointment', demo: true, message: 'Appointment payload validated. Calendar/database persistence is not configured.' });
  } catch { return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 }); }
}