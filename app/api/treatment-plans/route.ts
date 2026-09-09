import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

const allowed = ['pending', 'accepted', 'declined', 'expired'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.patient_id || !body?.treatment_name) {
      return NextResponse.json({ ok: false, error: 'patient_id and treatment_name are required' }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const record = {
      clinic_id: DEMO_CLINIC_ID,
      patient_id: String(body.patient_id),
      treatment_name: String(body.treatment_name).trim(),
      estimated_value: Number(body.estimated_value ?? body.estimatedValue ?? 0) || 0,
      status: 'pending',
      proposed_at: body.proposed_at ?? new Date().toISOString(),
      follow_up_at: body.follow_up_at ?? body.followUpAt ?? null,
      notes: body.notes ? String(body.notes) : null,
    };
    const { data, error } = await supabase.from('treatment_plans').insert(record).select('*').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await supabase.from('activity_log').insert({ clinic_id: DEMO_CLINIC_ID, patient_id: data.patient_id, event_type: 'treatment_plan_created', description: `Treatment plan created: ${data.treatment_name}`, metadata: { treatment_plan_id: data.id } });
    return NextResponse.json({ ok: true, treatmentPlan: data }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body?.id) return NextResponse.json({ ok: false, error: 'Treatment plan id is required' }, { status: 400 });
    if (body.status !== undefined && !allowed.includes(body.status)) return NextResponse.json({ ok: false, error: 'Invalid treatment plan status' }, { status: 400 });
    const update: Record<string, unknown> = {};
    for (const key of ['treatment_name', 'estimated_value', 'status', 'follow_up_at', 'notes']) if (body[key] !== undefined) update[key] = body[key];
    if (body.status === 'accepted') update.accepted_at = new Date().toISOString();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('treatment_plans').update(update).eq('id', body.id).eq('clinic_id', DEMO_CLINIC_ID).select('*').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await supabase.from('activity_log').insert({ clinic_id: DEMO_CLINIC_ID, patient_id: data.patient_id, event_type: 'treatment_plan_updated', description: `Treatment plan updated to ${data.status}`, metadata: { treatment_plan_id: data.id, status: data.status } });
    return NextResponse.json({ ok: true, treatmentPlan: data });
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
  }
}
