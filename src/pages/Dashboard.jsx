import { Badge, PriorityDot, Avatar, StatCard, Card, SectionHead } from '../components/UI'
import { useMobile } from '../hooks/useMobile'
import { fmt, dLeft, isOD, USERS } from '../lib/data'

export default function Dashboard({ user, projects, tasks, onOpenProject, t }) {
  const isMobile = useMobile()
  const allP     = projects.flatMap(p => p.procedures.map(pr => ({ ...pr, pname: p.name, pid: p.id })))
  const odProcs  = allP.filter(pr => isOD(pr.deadline) && pr.status !== 'completed')
  const odTasks  = tasks.filter(tk => isOD(tk.dueDate) && tk.status !== 'completed')
  const cuWarn   = projects.filter(p => { const d = dLeft(p.dataExpirare); return d !== null && d <= 30 && d >= 0 })

  const todayStr = new Date().toISOString().split('T')[0]
  const in7Str   = (() => { const r = new Date(); r.setDate(r.getDate()+7); return r.toISOString().split('T')[0] })()
  const todayTasks = tasks.filter(tk => tk.status !== 'completed' && tk.dueDate && tk.dueDate <= todayStr)
  const weekTasks  = tasks.filter(tk => tk.status !== 'completed' && tk.dueDate && tk.dueDate > todayStr && tk.dueDate <= in7Str)
  const upcoming   = allP.flatMap(pr => { const d = dLeft(pr.deadline); return d !== null && d > 0 && d <= 30 ? [{...pr,days:d}] : [] }).sort((a,b) => a.days-b.days)
  const totalAlerts = odProcs.length + odTasks.length + cuWarn.length
  const hasAlerts   = totalAlerts > 0

  const stats = [
    { label: 'Proiecte Active',    value: projects.filter(p => p.status==='in_progress').length, icon: '📁', gradient: t.statCards?.[0]?.bg },
    { label: 'Proceduri în Lucru', value: allP.filter(p => p.status==='in_progress').length,     icon: '🔧', gradient: t.statCards?.[1]?.bg },
    { label: 'Atenționări Active', value: totalAlerts,                                           icon: '⚠️', gradient: t.statCards?.[2]?.bg },
    { label: 'Total Proiecte',     value: projects.length,                                       icon: '🏗',  gradient: t.statCards?.[3]?.bg },
  ]

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 1200, animation: 'fadeIn 0.35s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.7px', color: t.text, margin: 0, lineHeight: 1.1 }}>
            Bună, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: t.muted, fontSize: 14, margin: '6px 0 0' }}>
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {hasAlerts && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${t.red}18`, border: `1px solid ${t.red}33`, borderRadius: 12, padding: '8px 16px' }}>
            <span>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.red }}>{totalAlerts} atenționăr{totalAlerts===1?'e':'i'} active</span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 12 : 18, marginBottom: 28 }}>
        {stats.map(s => <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} gradient={s.gradient} t={t} />)}
      </div>

      {/* Alerts */}
      {hasAlerts && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead icon="🚨" title="Atenționări" t={t} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cuWarn.map(p => (
              <div key={p.id} onClick={() => onOpenProject(p.id)}
                style={{ background: t.card, border: `1px solid ${t.orange}44`, borderLeft: `4px solid ${t.orange}`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'transform 0.15s', boxShadow: t.shadow }}
                onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${t.orange}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: t.orange, fontWeight: 700, fontSize: 13 }}>Certificat de Urbanism expiră în {dLeft(p.dataExpirare)} zile</div>
                  <div style={{ color: t.muted, fontSize: 12, marginTop: 2 }}>{p.name} · {p.certificat}</div>
                </div>
                <span style={{ color: t.muted, fontSize: 13 }}>→</span>
              </div>
            ))}

            {odProcs.length > 0 && (
              <div style={{ background: t.card, border: `1px solid ${t.red}33`, borderLeft: `4px solid ${t.red}`, borderRadius: 12, padding: '16px 18px', boxShadow: t.shadow }}>
                <div style={{ color: t.red, fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${t.red}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>!</span>
                  {odProcs.length} Procedur{odProcs.length>1?'i':'ă'} cu termen depășit
                </div>
                {odProcs.slice(0,4).map(pr => (
                  <div key={pr.id} onClick={() => onOpenProject(pr.pid, pr.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.1s', marginBottom: 2 }}
                    onMouseEnter={e => e.currentTarget.style.background=`${t.accent}10`}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.red, flexShrink: 0 }} />
                    <span style={{ color: t.sub, fontSize: 13, fontWeight: 500, flex: 1 }}>{pr.name}</span>
                    <span style={{ color: t.muted, fontSize: 12 }}>{pr.pname}</span>
                    <span style={{ color: t.red, fontSize: 12, fontWeight: 700, marginLeft: 8 }}>+{Math.abs(dLeft(pr.deadline))}z</span>
                    <span style={{ color: t.muted, fontSize: 12 }}>→</span>
                  </div>
                ))}
              </div>
            )}

            {odTasks.length > 0 && (
              <div style={{ background: t.card, border: `1px solid ${t.red}22`, borderLeft: `4px solid ${t.purple||'#8B5CF6'}`, borderRadius: 12, padding: '16px 18px', boxShadow: t.shadow }}>
                <div style={{ color: t.purple||'#8B5CF6', fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${t.purple||'#8B5CF6'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>!</span>
                  {odTasks.length} Sarcin{odTasks.length>1?'i':'ă'} cu termen depășit
                </div>
                {odTasks.slice(0,4).map(tk => (
                  <div key={tk.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${t.border}55` }}>
                    <PriorityDot priority={tk.priority} height={18} />
                    <span style={{ color: t.sub, fontSize: 13, flex: 1 }}>{tk.title}</span>
                    <Avatar userId={tk.assignedTo} size={20} />
                    <span style={{ color: t.red, fontSize: 12, fontWeight: 700, marginLeft: 6 }}>+{Math.abs(dLeft(tk.dueDate))}z</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today & Week */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 14 : 22, marginBottom: 24 }}>
        <Card t={t}>
          <SectionHead icon="📌" title="Astăzi" count={todayTasks.length}
            action={todayTasks.length > 0 && <span style={{ background: t.red, color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '2px 8px' }}>{todayTasks.length}</span>}
            t={t} />
          {todayTasks.length === 0
            ? <p style={{ color: t.muted, fontSize: 13, margin: '8px 0 0' }}>Nicio sarcină pentru astăzi 🎉</p>
            : todayTasks.map(tk => <TaskRow key={tk.id} task={tk} projects={projects} onOpenProject={onOpenProject} t={t} />)}
        </Card>
        <Card t={t}>
          <SectionHead icon="📆" title="Această săptămână" count={weekTasks.length}
            action={weekTasks.length > 0 && <span style={{ background: t.accent, color: t.accentText, borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '2px 8px' }}>{weekTasks.length}</span>}
            t={t} />
          {weekTasks.length === 0
            ? <p style={{ color: t.muted, fontSize: 13, margin: '8px 0 0' }}>Nicio sarcină această săptămână</p>
            : weekTasks.map(tk => <TaskRow key={tk.id} task={tk} projects={projects} onOpenProject={onOpenProject} t={t} showDate />)}
        </Card>
      </div>

      {/* Projects quick access */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead icon="📁" title="Proiecte" t={t} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {projects.map((p, idx) => {
              const total = p.procedures.length
              const done  = p.procedures.filter(pr => pr.status==='completed').length
              const pct   = total > 0 ? Math.round(done/total*100) : 0
              const sc    = t.statCards?.[idx%4]
              const expD  = dLeft(p.dataExpirare)
              const expW  = expD !== null && expD <= 30 && expD >= 0
              return (
                <div key={p.id} onClick={() => onOpenProject(p.id)}
                  style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s', boxShadow: t.shadow }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.boxShadow=`0 10px 30px rgba(0,0,0,0.25)` }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=t.border; e.currentTarget.style.boxShadow=t.shadow }}>
                  <div style={{ height: 4, background: sc?.bg || t.accentGrad }} />
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: t.accent, fontFamily:"'DM Mono',monospace", background:`${t.accent}18`, padding:'1px 6px', borderRadius:5, display:'inline-block', marginBottom:10 }}>{p.certificat}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontSize:11, color:t.muted }}>{done}/{total} proceduri</span>
                      <span style={{ fontSize:12, fontWeight:700, color:t.text }}>{pct}%</span>
                    </div>
                    <div style={{ height:4, background:t.bg, borderRadius:99, overflow:'hidden', marginBottom:6 }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:pct===100?t.green:sc?.bg||t.accentGrad, borderRadius:99 }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:11, color:expW?t.orange:t.muted }}>⏰ {fmt(p.dataExpirare)}{expW?` · ${expD}z`:''}</span>
                      <Badge status={p.status} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming procedure deadlines */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHead icon="🗓" title="Termene Proceduri" t={t} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill,minmax(250px,1fr))', gap: 10 }}>
            {upcoming.slice(0,8).map((item,i) => {
              const urgent = item.days <= 7
              return (
                <div key={i} onClick={() => onOpenProject(item.pid, item.id)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:t.bg, borderRadius:12, cursor:'pointer', border:`1px solid ${urgent?t.orange+'44':t.border}`, transition:'all 0.15s', boxShadow:t.shadow }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=urgent?t.orange+'44':t.border; e.currentTarget.style.transform='translateY(0)' }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:urgent?`${t.orange}20`:`${t.accent}15`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:20, fontWeight:800, color:urgent?t.orange:t.accent, lineHeight:1 }}>{item.days}</span>
                    <span style={{ fontSize:9, color:t.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>zile</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:t.text, fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:3 }}>{item.name}</div>
                    <div style={{ color:t.muted, fontSize:11 }}>{item.pname}</div>
                  </div>
                  <span style={{ color:t.muted, fontSize:13, flexShrink:0 }}>→</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 20px', color:t.muted }}>
          <div style={{ fontSize:64, marginBottom:20, opacity:0.5 }}>🏗</div>
          <p style={{ fontSize:18, color:t.sub, fontWeight:700, marginBottom:8 }}>Bun venit în AutorizAct!</p>
          <p style={{ fontSize:14 }}>Adaugă primul proiect din meniul Proiecte pentru a începe</p>
        </div>
      )}
    </div>
  )
}

function TaskRow({ task: tk, projects, onOpenProject, t, showDate }) {
  const proj = projects.find(p => p.id === tk.projectId)
  const days = dLeft(tk.dueDate)
  const proc = proj?.procedures?.find(p => p.id === tk.procId)
  return (
    <div
      onClick={() => proj && onOpenProject(proj.id, tk.procId || null)}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 8px', borderRadius:8, borderBottom:`1px solid ${t.border}55`, cursor: proj ? 'pointer' : 'default', transition:'background 0.1s' }}
      onMouseEnter={e => { if(proj) e.currentTarget.style.background=`${t.accent}0A` }}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
      <PriorityDot priority={tk.priority} height={30} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:t.text, fontSize:13, fontWeight:500, marginBottom:3, lineHeight:1.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{tk.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Avatar userId={tk.assignedTo} size={16} />
          <span style={{ fontSize:11, color:t.muted }}>{USERS[tk.assignedTo]?.name?.split(' ')[0]}</span>
          {proj && <span style={{ fontSize:11, color:t.muted }}>· {proj.name}</span>}
          <Badge status={tk.status} />
        </div>
      </div>
      {showDate && days !== null && (
        <span style={{ fontSize:11, fontWeight:700, color:days<=2?t.orange:t.muted, flexShrink:0, background:days<=2?`${t.orange}18`:'transparent', padding:'2px 7px', borderRadius:6 }}>
          {days===0?'AZI':`${days}z`}
        </span>
      )}
      {!showDate && days !== null && days <= 0 && (
        <span style={{ fontSize:11, fontWeight:700, color:t.red, flexShrink:0, background:`${t.red}18`, padding:'2px 7px', borderRadius:6 }}>
          {Math.abs(days)}z dep.
        </span>
      )}
    </div>
  )
}
