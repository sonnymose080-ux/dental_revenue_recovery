import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
    const message = body.message || body.text || body.body;
    if (!message) return NextResponse.json({ ok: false, error: 'Message content is required' }, { status: 400 });
    const channel = String(body.channel || 'web');
    const allowed = ['whatsapp','sms','email','phone','instagram','facebook','web'];
    if (!allowed.includes(channel)) return NextResponse.json({ ok: false, error: `Unsupported channel: ${channel}` }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const handoff = /urgent|emergency|severe pain|bleeding|swelling/i.test(String(message));
    const { data, error } = await supabase.from('communications').insert({ clinic_id: DEMO_CLINIC_ID, patient_id: body.patient_id || body.patientId || null, lead_id: body.lead_id || body.leadId || null, channel, direction: body.direction || 'inbound', message: String(message), status: handoff ? 'human_handoff' : 'logged', external_id: body.external_id || body.externalId || null }).select('id,channel,direction,status,created_at').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await supabase.from('activity_log').insert({ clinic_id: DEMO_CLINIC_ID, patient_id: body.patient_id || body.patientId || null, lead_id: body.lead_id || body.leadId || null, event_type: handoff ? 'human_handoff' : 'message_received', description: handoff ? 'Message flagged for human handoff' : 'Message logged', metadata: { channel } });
    return NextResponse.json({ ok: true, received: true, event: 'message', demo: false, handoff, communication: data }, { status: 201 });
  } catch { return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 }); }
}
