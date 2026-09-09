import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
    if (!body.name && !body.phone && !body.email) return NextResponse.json({ ok: false, error: 'Lead requires name, phone, or email' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const lead = {
      clinic_id: DEMO_CLINIC_ID,
      name: String(body.name || 'Unnamed lead').trim(),
      phone: body.phone ? String(body.phone).trim() : null,
      email: body.email ? String(body.email).trim() : null,
      source: body.source ? String(body.source).trim() : 'dashboard',
      status: ['new', 'contacted', 'qualified', 'appointment', 'won', 'lost', 'no_response'].includes(body.status) ? body.status : 'new',
      follow_up_at: body.follow_up_at || null,
      estimated_value: Number(body.estimated_value ?? 0) || 0,
      notes: body.notes ? String(body.notes) : null,
    };
    const { data, error } = await supabase.from('leads').insert(lead).select('*').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await supabase.from('activity_log').insert({ clinic_id: DEMO_CLINIC_ID, lead_id: data.id, event_type: 'lead_created', description: 'Lead created from dashboard', metadata: { source: lead.source } });
    return NextResponse.json({ ok: true, lead: data }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
  }
}
