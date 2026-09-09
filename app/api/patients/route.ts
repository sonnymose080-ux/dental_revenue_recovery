import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.full_name || !body?.phone) return NextResponse.json({ ok: false, error: 'full_name and phone are required' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('patients').insert({ clinic_id: DEMO_CLINIC_ID, full_name: String(body.full_name).trim(), phone: String(body.phone).trim(), email: body.email ? String(body.email).trim() : null, source: body.source ? String(body.source).trim() : 'manual' }).select('*').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await supabase.from('activity_log').insert({ clinic_id: DEMO_CLINIC_ID, patient_id: data.id, event_type: 'patient_created', description: 'Patient created', metadata: { source: data.source } });
    return NextResponse.json({ ok: true, patient: data }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
  }
}
