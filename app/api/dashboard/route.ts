import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const clinicId = DEMO_CLINIC_ID;
    const [leads, patients, appointments, plans, recovery] = await Promise.all([
      supabase.from('leads').select('id,status,estimated_value,follow_up_at').eq('clinic_id', clinicId),
      supabase.from('patients').select('id,status').eq('clinic_id', clinicId),
      supabase.from('appointments').select('id,status,scheduled_at').eq('clinic_id', clinicId),
      supabase.from('treatment_plans').select('id,status,estimated_value').eq('clinic_id', clinicId),
      supabase.from('recovery_opportunities').select('id,status,priority,value_at_risk,type,assigned_to').eq('clinic_id', clinicId),
    ]);
    const errors = [leads, patients, appointments, plans, recovery].filter(x => x.error).map(x => x.error?.message);
    if (errors.length) return NextResponse.json({ ok: false, error: errors[0] }, { status: 500 });
    const rows = recovery.data ?? [];
    const recovered = rows.filter(r => r.status === 'recovered').reduce((s, r) => s + Number(r.value_at_risk || 0), 0);
    const atRisk = rows.filter(r => ['open','contacted','engaged'].includes(r.status)).reduce((s, r) => s + Number(r.value_at_risk || 0), 0);
    return NextResponse.json({
      ok: true,
      clinicId,
      metrics: {
        revenueRecovered: recovered,
        treatmentValueAtRisk: atRisk,
        missedAppointments: (appointments.data ?? []).filter(a => a.status === 'no_show').length,
        followUpsDue: (leads.data ?? []).filter(l => l.follow_up_at && new Date(l.follow_up_at) <= new Date()).length,
      },
      counts: {
        leads: leads.data?.length ?? 0,
        patients: patients.data?.length ?? 0,
        appointments: appointments.data?.length ?? 0,
        treatmentPlans: plans.data?.length ?? 0,
        recovery: rows.length,
      },
      recovery: rows,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Database unavailable' }, { status: 503 });
  }
}
