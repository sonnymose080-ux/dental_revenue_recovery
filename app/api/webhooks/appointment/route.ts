import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
    if (!body.patient_id && !body.patientId && !body.phone && !body.email) return NextResponse.json({ ok: false, error: 'Appointment requires a patient identifier' }, { status: 400 });
    if (!body.scheduled_at && !body.scheduledAt) return NextResponse.json({ ok: false, error: 'scheduled_at is required' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    let patientId = body.patient_id || body.patientId || null;
    if (!patientId && (body.phone || body.email)) {
      const q = supabase.from('patients').select('id').eq('clinic_id', DEMO_CLINIC_ID);
      const result = body.phone ? await q.eq('phone', String(body.phone)).maybeSingle() : await q.eq('email', String(body.email)).maybeSingle();
      patientId = result.data?.id || null;
    }
    if (!patientId) return NextResponse.json({ ok: false, error: 'Patient record not found. Create the patient before the appointment.' }, { status: 404 });
    const { data, error } = await supabase.from('appointments').insert({ clinic_id: DEMO_CLINIC_ID, patient_id: patientId, scheduled_at: body.scheduled_at || body.scheduledAt, status: body.status || 'scheduled', appointment_type: body.appointment_type || body.appointmentType || null, source: body.source || 'webhook', notes: body.notes || null }).select('*').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await supabase.from('activity_log').insert({ clinic_id: DEMO_CLINIC_ID, patient_id: patientId, event_type: 'appointment_created', description: 'Appointment created from webhook', metadata: { source: body.source || 'webhook' } });
    return NextResponse.json({ ok: true, received: true, event: 'appointment', demo: false, appointment: data }, { status: 201 });
  } catch { return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 }); }
}
