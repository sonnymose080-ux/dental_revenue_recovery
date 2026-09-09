import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

const allowed = ['open', 'contacted', 'engaged', 'recovered', 'closed'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!id) return NextResponse.json({ ok: false, error: 'Recovery opportunity id is required' }, { status: 400 });
    if (!allowed.includes(body.status)) return NextResponse.json({ ok: false, error: 'Invalid recovery status' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const update: Record<string, unknown> = { status: body.status };
    if (body.assigned_to !== undefined) update.assigned_to = body.assigned_to || null;
    if (body.outcome !== undefined) update.outcome = body.outcome || null;
    if (body.next_action_at !== undefined) update.next_action_at = body.next_action_at || null;

    const { data, error } = await supabase.from('recovery_opportunities').update(update).eq('id', id).eq('clinic_id', DEMO_CLINIC_ID).select('*').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    await supabase.from('activity_log').insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: data.patient_id,
      event_type: 'recovery_status_updated',
      description: `Recovery opportunity moved to ${body.status}`,
      metadata: { recovery_id: id, status: body.status },
    });
    return NextResponse.json({ ok: true, recovery: data });
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
  }
}
