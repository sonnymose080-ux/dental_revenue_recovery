import { NextResponse } from 'next/server';
import { DEMO_CLINIC_ID, getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const clinicId = DEMO_CLINIC_ID;
    const [clinic, leads, patients, appointments, plans, recovery] = await Promise.all([
      supabase.from('clinics').select('id,name,timezone,currency').eq('id', clinicId).single(),
      supabase.from('leads').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
      supabase.from('patients').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').eq('clinic_id', clinicId).order('scheduled_at', { ascending: true }),
      supabase.from('treatment_plans').select('*').eq('clinic_id', clinicId).order('created_at', { ascending: false }),
      supabase.from('recovery_opportunities').select('*').eq('clinic_id', clinicId).order('priority', { ascending: false }).order('created_at', { ascending: false }),
    ]);
    const results = [clinic, leads, patients, appointments, plans, recovery];
    const error = results.find(r => r.error)?.error;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    const leadRows = leads.data ?? [];
    const appointmentRows = appointments.data ?? [];
    const planRows = plans.data ?? [];
    const recoveryRows = recovery.data ?? [];
    const recovered = recoveryRows.filter(r => r.status === 'recovered').reduce((s, r) => s + Number(r.value_at_risk || 0), 0);
    const atRisk = recoveryRows.filter(r => ['open', 'contacted', 'engaged'].includes(r.status)).reduce((s, r) => s + Number(r.value_at_risk || 0), 0);
    const now = Date.now();
    const followUpsDue = leadRows.filter(l => l.follow_up_at && new Date(l.follow_up_at).getTime() <= now).length + planRows.filter(p => p.follow_up_at && new Date(p.follow_up_at).getTime() <= now && p.status === 'pending').length;

    return NextResponse.json({
      ok: true,
      clinic: clinic.data,
      metrics: {
        revenueRecovered: recovered,
        treatmentValueAtRisk: atRisk,
        missedAppointments: appointmentRows.filter(a => a.status === 'no_show').length,
        followUpsDue,
      },
      counts: { leads: leadRows.length, patients: patients.data?.length ?? 0, appointments: appointmentRows.length, treatmentPlans: planRows.length, recovery: recoveryRows.length },
      leads: leadRows,
      patients: patients.data ?? [],
      appointments: appointmentRows,
      treatmentPlans: planRows,
      recovery: recoveryRows,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Database unavailable' }, { status: 503 });
  }
}
