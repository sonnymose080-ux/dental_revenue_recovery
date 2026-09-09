'use client';

import { useMemo, useState } from 'react';
import { Activity, AlertCircle, BarChart3, Bell, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, LayoutDashboard, MessageCircle, MoreHorizontal, Search, Settings, Stethoscope, Users, UserRound, XCircle } from 'lucide-react';

type Section = 'Overview' | 'Leads' | 'Patients' | 'Appointments' | 'Revenue Recovery' | 'Treatment Plans' | 'Analytics' | 'Integrations';

type Lead = { name: string; source: string; status: string; value: number; followUp: string };

const nav: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Leads', icon: Users }, { label: 'Patients', icon: UserRound },
  { label: 'Appointments', icon: CalendarDays }, { label: 'Revenue Recovery', icon: CircleDollarSign }, { label: 'Treatment Plans', icon: Stethoscope },
  { label: 'Analytics', icon: BarChart3 }, { label: 'Integrations', icon: Settings },
];

const leads: Lead[] = [
  { name: 'Mary Wanjiku', source: 'WhatsApp', status: 'New', value: 45000, followUp: 'Today' },
  { name: 'Brian Otieno', source: 'Instagram', status: 'Contacted', value: 28000, followUp: 'Today' },
  { name: 'Grace Njeri', source: 'Google', status: 'Appointment', value: 65000, followUp: 'Tomorrow' },
  { name: 'David Mwangi', source: 'Website', status: 'No response', value: 35000, followUp: 'Overdue' },
];

const recovery = [
  ['Missed appointment', 'Peter Kamau', 'KES 18,000', 'High'],
  ['Treatment not accepted', 'Anne Achieng', 'KES 72,000', 'High'],
  ['Dormant patient', 'John Mutua', 'KES 35,000', 'Medium'],
  ['Overdue follow-up', 'Lucy Wambui', 'KES 24,000', 'Medium'],
];

const money = (n: number) => `KES ${n.toLocaleString('en-KE')}`;

export default function Home() {
  const [section, setSection] = useState<Section>('Overview');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notice, setNotice] = useState('');

  const filteredLeads = useMemo(() => leads.filter(l => `${l.name} ${l.source} ${l.status}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const action = (text: string) => { setNotice(text); setTimeout(() => setNotice(''), 2600); };

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={20}/></div><div><strong>Dental<span>Flow</span></strong><small>Revenue Operations</small></div></div>
      <div className="clinic"><div className="clinic-avatar">SS</div><div><strong>Sunny Smile Dental</strong><small>Clinic workspace</small></div><ChevronRight size={15}/></div>
      <nav>{nav.map(({label, icon: Icon}) => <button key={label} className={section === label ? 'nav-item active' : 'nav-item'} onClick={() => setSection(label)}><Icon size={18}/><span>{label}</span>{label === 'Revenue Recovery' && <b>4</b>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="live"><span/> System ready <small>Demo mode</small></div><button className="nav-item"><Settings size={18}/> <span>Settings</span></button></div>
    </aside>

    <section className="content">
      <header className="topbar"><div><p className="eyebrow">PATIENT OPERATIONS</p><h1>{section}</h1></div><div className="top-actions"><div className="search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search patients, leads..."/></div><button className="icon-btn" onClick={() => action('No new notifications')}><Bell size={18}/><i/></button><div className="avatar">DM</div></div></header>

      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}

      {section === 'Overview' && <>
        <div className="demo-banner"><AlertCircle size={17}/><div><strong>Demo data</strong><span>Connect your clinic systems to replace these sample records with live data.</span></div><button onClick={() => setSection('Integrations')}>Configure integrations <ChevronRight size={15}/></button></div>
        <div className="metrics">
          <Metric title="Revenue recovered" value="KES 486,000" delta="+18.4%" icon={<CircleDollarSign/>}/>
          <Metric title="Treatment value at risk" value="KES 1.24M" delta="32 opportunities" icon={<AlertCircle/>} risk/>
          <Metric title="Missed appointments" value="18" delta="4 this week" icon={<CalendarDays/>}/>
          <Metric title="Follow-ups due" value="27" delta="9 overdue" icon={<Clock3/>} risk/>
        </div>
        <div className="grid-main"><div className="panel"><PanelTitle title="Revenue recovery pipeline" action="View recovery" onClick={() => setSection('Revenue Recovery')}/><div className="pipeline"><Stage label="Identified" value="KES 1.24M" count="32"/><Stage label="Contacted" value="KES 742K" count="19"/><Stage label="Engaged" value="KES 428K" count="11"/><Stage label="Recovered" value="KES 486K" count="14" last/></div></div>
          <div className="panel"><PanelTitle title="Conversion snapshot" action="Analytics" onClick={() => setSection('Analytics')}/><div className="bars"><Bar label="Lead → appointment" value={68}/><Bar label="Appointment → treatment" value={54}/><Bar label="Treatment acceptance" value={71}/><Bar label="No-show rate" value={12}/></div></div></div>
        <div className="panel"><PanelTitle title="Priority recovery opportunities" action="View all" onClick={() => setSection('Revenue Recovery')}/><RecoveryTable onAction={action}/></div>
      </>}

      {section === 'Leads' && <div className="panel page-panel"><PanelTitle title="Lead pipeline" action="+ New lead" onClick={() => action('Lead creation form is ready for the database connection')}/><div className="filters"><div className="filter active">All <b>{leads.length}</b></div><div className="filter">New <b>1</b></div><div className="filter">Contacted <b>1</b></div><div className="filter">Appointment <b>1</b></div></div><div className="table"><div className="tr th"><span>Lead</span><span>Source</span><span>Status</span><span>Est. value</span><span>Follow-up</span><span/></div>{filteredLeads.map(l => <button className="tr row" key={l.name} onClick={() => setSelected(l)}><span><strong>{l.name}</strong><small>Patient enquiry</small></span><span>{l.source}</span><span><em className={l.status === 'No response' ? 'pill red' : 'pill'}>{l.status}</em></span><span>{money(l.value)}</span><span>{l.followUp}</span><ChevronRight size={16}/></button>)}</div></div>}

      {section === 'Patients' && <ListPage title="Patients" subtitle="Patient profiles, treatment status and communication activity." items={['Mary Wanjiku','Brian Otieno','Grace Njeri','David Mwangi','Anne Achieng']} action={action}/>} 
      {section === 'Appointments' && <ListPage title="Appointments" subtitle="Upcoming, completed, cancelled and no-show appointments." items={['09:00 — Mary Wanjiku','10:30 — Brian Otieno','13:00 — Grace Njeri','15:30 — Peter Kamau']} action={action}/>} 
      {section === 'Revenue Recovery' && <div className="panel page-panel"><PanelTitle title="Recovery queue" action="Create task" onClick={() => action('Recovery task created')}/><RecoveryTable onAction={action}/></div>}
      {section === 'Treatment Plans' && <ListPage title="Treatment Plans" subtitle="Track proposed treatment, estimated value and acceptance." items={['Anne Achieng — KES 72,000 — Pending','Grace Njeri — KES 65,000 — Accepted','Peter Kamau — KES 18,000 — Pending','Lucy Wambui — KES 24,000 — Declined']} action={action}/>} 
      {section === 'Analytics' && <Analytics/>}
      {section === 'Integrations' && <Integrations action={action}/>} 
    </section>
    {selected && <div className="overlay" onClick={() => setSelected(null)}><div className="drawer" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}><XCircle size={20}/></button><div className="profile-head"><div className="large-avatar">{selected.name.split(' ').map(x=>x[0]).join('')}</div><div><p className="eyebrow">LEAD PROFILE</p><h2>{selected.name}</h2><span>{selected.source} · {selected.status}</span></div></div><div className="detail-grid"><div><small>Estimated treatment</small><strong>{money(selected.value)}</strong></div><div><small>Next follow-up</small><strong>{selected.followUp}</strong></div></div><div className="activity"><h3>Activity</h3><div><MessageCircle size={17}/><span>Enquiry received via {selected.source}<small>Today · Demo activity</small></span></div><div><CalendarDays size={17}/><span>Follow-up scheduled<small>Today · Pending</small></span></div></div><button className="primary" onClick={() => action('Follow-up draft created')}>Generate follow-up draft</button></div></div>}
  </main>;
}

function Metric({title,value,delta,icon,risk=false}:{title:string,value:string,delta:string,icon:React.ReactNode,risk?:boolean}) { return <div className="metric"><div className="metric-top"><div className={risk ? 'metric-icon risk' : 'metric-icon'}>{icon}</div><span className={risk ? 'delta risk-text' : 'delta'}>{delta}</span></div><small>{title}</small><strong>{value}</strong></div> }
function PanelTitle({title,action,onClick}:{title:string,action:string,onClick:()=>void}) { return <div className="panel-title"><div><h2>{title}</h2></div><button onClick={onClick}>{action}<ChevronRight size={15}/></button></div> }
function Stage({label,value,count,last=false}:{label:string,value:string,count:string,last?:boolean}) { return <div className="stage"><div className="stage-dot"><span/></div><div><small>{label}</small><strong>{value}</strong><span>{count} opportunities</span></div>{!last && <div className="stage-line"/>}</div> }
function Bar({label,value}:{label:string,value:number}) { return <div className="bar-row"><div><span>{label}</span><strong>{value}%</strong></div><div className="bar-track"><i style={{width:`${value}%`}}/></div></div> }
function RecoveryTable({onAction}:{onAction:(s:string)=>void}) { return <div className="table">{recovery.map((r,i)=><div className="tr row" key={i}><span><strong>{r[0]}</strong><small>{r[1]}</small></span><span><em className={r[3] === 'High' ? 'pill red' : 'pill amber'}>{r[3]}</em></span><span><strong>{r[2]}</strong></span><span>Unassigned</span><button className="small-action" onClick={()=>onAction(`Recovery task for ${r[1]} created`)}>Recover</button><MoreHorizontal size={18}/></div>)}</div> }
function ListPage({title,subtitle,items,action}:{title:string,subtitle:string,items:string[],action:(s:string)=>void}) { return <div className="panel page-panel"><div className="panel-title"><div><h2>{title}</h2><p>{subtitle}</p></div><button onClick={()=>action('Action queued for database connection')}>+ Add</button></div><div className="list">{items.map((x,i)=><div className="list-row" key={x}><div className="large-avatar small">{i<9 ? `0${i+1}` : i+1}</div><div><strong>{x.split(' — ')[0]}</strong><small>{x.includes(' — ') ? x.substring(x.indexOf(' — ')+3) : 'Record'}</small></div><span className="pill">Active</span><button onClick={()=>action(`${x.split(' — ')[0]} opened`)}>Open <ChevronRight size={15}/></button></div>)}</div></div> }
function Analytics() { return <div className="analytics-grid"><div className="panel"><PanelTitle title="Funnel performance" action="Last 30 days" onClick={()=>{}}/><div className="funnel"><div style={{width:'100%'}}>1,248 <span>Leads</span></div><div style={{width:'78%'}}>974 <span>Appointments</span></div><div style={{width:'58%'}}>721 <span>Treatments</span></div><div style={{width:'39%'}}>486 <span>Recovered</span></div></div></div><div className="panel"><PanelTitle title="Revenue metrics" action="KES" onClick={()=>{}}/><div className="metric-list"><p>Revenue recovered <strong>KES 486,000</strong></p><p>Revenue at risk <strong>KES 1,240,000</strong></p><p>Average recovery <strong>KES 34,714</strong></p><p>Recovery rate <strong>39.2%</strong></p></div></div></div> }
function Integrations({action}:{action:(s:string)=>void}) { const items=[['n8n','Workflow automation','Ready to connect'],['WhatsApp','Patient messaging','Not connected'],['Calendar','Appointment scheduling','Not connected'],['CRM / data source','Patient & lead data','Not connected'],['AI provider','Follow-up drafting','Not connected']]; return <div className="integration-list">{items.map(x=><div className="integration" key={x[0]}><div className="integration-icon"><Activity size={20}/></div><div><strong>{x[0]}</strong><small>{x[1]}</small></div><span>{x[2]}</span><button onClick={()=>action(`${x[0]} integration settings opened`)}>Configure <ChevronRight size={15}/></button></div>)}</div> }
