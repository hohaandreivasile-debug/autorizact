import { useState, useRef } from 'react'
import { Badge, PriorityDot, Avatar, Modal, FormInput, BtnRow, PillBtn, PrimaryBtn, Card } from '../components/UI'
import { USERS, PRIORITY, STATUS, dLeft, isOD, fmt } from '../lib/data'
import { openWhatsApp } from './Chat'
import { useMobile } from '../hooks/useMobile'

// ── Voice command parser ──────────────────────────────────────────
// Recunoaște comenzi de forma:
//   "adaugă sarcină: Depune dosar ISU pentru Raccosta până pe 15 mai"
//   "completează sarcina: Depune dosar ISU"
//   "sarcină nouă: Trimite memoriu APM"
function parseVoiceCommand(text, tasks, projects) {
  const t = text.toLowerCase().trim()

  // ADD patterns
  const addMatch = t.match(/(?:adaugă|adauga|sarcin[ăa] nou[ăa]|nou[ăa] sarcin[ăa])[\s:]+(.+)/)
  if (addMatch) {
    let rest = addMatch[1]
    let assignedTo = 'raccosta'
    let dueDate = ''
    let priority = 'medium'

    // detect person
    if (rest.includes('dacian') || rest.includes('nath')) assignedTo = 'dacian'
    if (rest.includes('sorin') || rest.includes('terpe')) assignedTo = 'sorin'
    if (rest.includes('raccosta') || rest.includes('giorgio')) assignedTo = 'raccosta'

    // detect priority
    if (rest.includes('urgent') || rest.includes('critic')) priority = 'high'
    if (rest.includes('scăzut') || rest.includes('scazut') || rest.includes('mic')) priority = 'low'

    // detect date: "până pe 15 mai", "pana pe 20 aprilie", "pe 5 iunie"
    const months = { 'ian':1,'feb':2,'mar':3,'apr':4,'mai':5,'iun':6,'iul':7,'aug':8,'sep':9,'oct':10,'noi':11,'dec':12,
      'ianuarie':1,'februarie':2,'martie':3,'aprilie':4,'mai':5,'iunie':6,'iulie':7,'august':8,'septembrie':9,'octombrie':10,'noiembrie':11,'decembrie':12 }
    const dateMatch = rest.match(/(?:până pe|pana pe|pe|până la|pana la)\s+(\d{1,2})\s+([a-zăîâșț]+)/i)
    if (dateMatch) {
      const day = parseInt(dateMatch[1])
      const mon = months[dateMatch[2].toLowerCase()]
      if (mon) {
        const year = new Date().getFullYear()
        const d = new Date(year, mon-1, day)
        if (d < new Date()) d.setFullYear(year+1)
        dueDate = d.toISOString().split('T')[0]
      }
      // clean date from title
      rest = rest.replace(dateMatch[0], '').replace(/pentru\s+(raccosta|dacian|sorin|giorgio|nath|terpe)/gi, '').trim()
    }

    // clean person from title
    rest = rest.replace(/pentru\s+(raccosta|dacian|sorin|giorgio|nath|terpe)/gi, '').trim()
    rest = rest.replace(/\s+/g, ' ').trim()

    // capitalize
    const title = rest.charAt(0).toUpperCase() + rest.slice(1)
    return { type: 'add', title, assignedTo, dueDate, priority }
  }

  // COMPLETE patterns
  const doneMatch = t.match(/(?:completează|completeaza|finalizează|finalizeaza|gata|rezolvat)[\s:]+(.+)/)
  if (doneMatch) {
    const keyword = doneMatch[1].trim()
    const found = tasks.find(tk => tk.status !== 'completed' &&
      tk.title.toLowerCase().includes(keyword))
    if (found) return { type: 'complete', taskId: found.id, taskTitle: found.title }
  }

  return null
}

function buildWaText(task, projects) {
  const proj = projects.find(p => p.id === task.projectId)
  const proc = proj?.procedures?.find(p => p.id === task.procId)
  const pr = PRIORITY[task.priority]; const st = STATUS[task.status]
  return ['📋 *AutorizAct — Sarcină*','',`*${task.title}*`,'',
    `📌 Prioritate: ${pr?.label||task.priority}`,`📊 Status: ${st?.label||task.status}`,
    task.dueDate?`⏰ Termen: ${fmt(task.dueDate)}`:null,
    proj?`🏗 Proiect: ${proj.name}`:null,proc?`🔧 Procedură: ${proc.name}`:null,
    USERS[task.assignedTo]?`👤 Asignat: ${USERS[task.assignedTo].name}`:null,
  ].filter(Boolean).join('\n')
}

// ── Task Form (reusable for add & edit) ──────────────────────────
function TaskForm({ title, init, projects, onCancel, onSave, t }) {
  const [form, setForm] = useState(init)
  const selProj  = projects.find(p => p.id === form.projectId)
  const procOpts = selProj?.procedures || []
  const sel = (label, field, options) => (
    <div>
      <label style={{ display:'block', color:t.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.6px' }}>{label}</label>
      <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value, ...(field==='projectId'?{procId:''}:{}) }))}
        disabled={field==='procId' && !form.projectId}
        style={{ width:'100%', background:t.bg, border:`1.5px solid ${t.border}`, borderRadius:10, padding:'10px 12px', color:t.text, fontSize:13, outline:'none', cursor:'pointer', fontFamily:'inherit', opacity:field==='procId'&&!form.projectId?0.4:1 }}>
        {options.map(({k,v}) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  )
  return (
    <Modal title={title} onClose={onCancel} t={t}>
      <FormInput label="Descriere Sarcină *" textarea rows={3} t={t} value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
        {sel('Asignat la','assignedTo', Object.values(USERS).map(u => ({k:u.id,v:u.name})))}
        {sel('Prioritate','priority', Object.entries(PRIORITY).map(([k,v]) => ({k,v:v.label})))}
        {sel('Status','status', Object.entries(STATUS).map(([k,v]) => ({k,v:v.label})))}
        {sel('Proiect','projectId', [{k:'',v:'— Selectează —'},...projects.map(p=>({k:p.id,v:p.name}))])}
        {sel('Procedură','procId', [{k:'',v:'— Selectează —'},...procOpts.map(p=>({k:p.id,v:p.name}))])}
      </div>
      <FormInput label="Termen Limită" type="date" t={t} value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate:e.target.value}))} />
      <BtnRow t={t} onCancel={onCancel} onSave={() => { if(form.title.trim()) onSave(form) }} saveLabel="Salvează" />
    </Modal>
  )
}

// ── Confirm Delete ───────────────────────────────────────────────
function ConfirmDelete({ message, onConfirm, onClose, t }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:24, backdropFilter:'blur(4px)' }}>
      <div style={{ background:t.card, border:`1px solid ${t.red}55`, borderRadius:20, padding:32, width:'100%', maxWidth:380, boxShadow:t.shadow }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${t.red}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🗑</div>
          <div style={{ fontSize:14, color:t.sub, lineHeight:1.4 }}>{message}</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:'transparent', border:`1.5px solid ${t.border}`, color:t.sub, borderRadius:10, padding:11, cursor:'pointer', fontWeight:600, fontFamily:'inherit', fontSize:14 }}>Anulare</button>
          <button onClick={onConfirm} style={{ flex:1, background:`linear-gradient(135deg,${t.red},#B91C1C)`, border:'none', color:'#fff', borderRadius:10, padding:11, cursor:'pointer', fontWeight:700, fontFamily:'inherit', fontSize:14 }}>Șterge</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────
export default function TasksView({ user, tasks, projects, onAddTask, onUpdateTaskStatus, onUpdateTask, onDeleteTask, t }) {
  const isMobile = useMobile()
  const [filter,    setFilter]    = useState('all')
  const [showAdd,   setShowAdd]   = useState(false)
  const [editTask,  setEditTask]  = useState(null)
  const [delTask,   setDelTask]   = useState(null)
  const [voiceOn,   setVoiceOn]   = useState(false)
  const [voiceTxt,  setVoiceTxt]  = useState('')
  const [voiceFb,   setVoiceFb]   = useState(null) // { type:'success'|'error'|'confirm', msg, action }
  const recogRef = useRef(null)

  const EMPTY = { title:'', assignedTo:'raccosta', dueDate:'', priority:'medium', projectId:'', procId:'', status:'pending' }

  // ── Voice recognition ──────────────────────────────────────────
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceFb({ type:'error', msg:'Browserul tău nu suportă comenzi vocale. Încearcă Chrome.' }); return }
    const r = new SR()
    r.lang = 'ro-RO'
    r.continuous = false
    r.interimResults = true
    r.onresult = e => {
      const txt = Array.from(e.results).map(r => r[0].transcript).join('')
      setVoiceTxt(txt)
      if (e.results[e.results.length-1].isFinal) {
        const cmd = parseVoiceCommand(txt, tasks, projects)
        if (!cmd) {
          setVoiceFb({ type:'error', msg: `Nu am înțeles comanda: "${txt}". Încearcă: "Adaugă sarcină: [titlu] pentru [persoană] până pe [zi] [lună]"` })
        } else if (cmd.type === 'add') {
          setVoiceFb({ type:'confirm', msg: `Adaug: „${cmd.title}" → ${USERS[cmd.assignedTo]?.name}${cmd.dueDate?` · ${fmt(cmd.dueDate)}`:''}`, action: () => {
            onAddTask({ ...cmd, assignedBy: user.id, status: 'pending', projectId: '', procId: '' })
            setVoiceFb({ type:'success', msg: `✓ Sarcină adăugată: „${cmd.title}"` })
            setTimeout(() => setVoiceFb(null), 2500)
          }})
        } else if (cmd.type === 'complete') {
          setVoiceFb({ type:'confirm', msg: `Marchez ca finalizată: „${cmd.taskTitle}"`, action: () => {
            onUpdateTaskStatus(cmd.taskId, 'completed')
            setVoiceFb({ type:'success', msg: `✓ Finalizat: „${cmd.taskTitle}"` })
            setTimeout(() => setVoiceFb(null), 2500)
          }})
        }
        setVoiceOn(false)
      }
    }
    r.onerror = () => { setVoiceOn(false); setVoiceFb({ type:'error', msg:'Eroare microfon. Verifică permisiunile.' }) }
    r.onend = () => setVoiceOn(false)
    recogRef.current = r
    r.start()
    setVoiceOn(true)
    setVoiceTxt('')
    setVoiceFb(null)
  }

  const stopVoice = () => { recogRef.current?.stop(); setVoiceOn(false) }

  const filtered = tasks.filter(tk => {
    if (filter==='mine')    return tk.assignedTo===user.id && tk.status!=='completed'
    if (filter==='overdue') return isOD(tk.dueDate) && tk.status!=='completed'
    if (filter==='active')  return tk.status!=='completed'
    return true
  })

  const FILTERS = [['all','Toate'],['active','Active'],['mine','Ale Mele'],['overdue','Depășite']]

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth:1000, animation:'fadeIn 0.35s ease', color:t.text }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.7px', color:t.text, margin:0 }}>Sarcini</h1>
          <p style={{ color:t.muted, fontSize:14, margin:'6px 0 0' }}>{tasks.filter(tk=>tk.status!=='completed').length} active · {tasks.filter(tk=>tk.status==='completed').length} finalizate</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {/* Voice button */}
          <button onClick={voiceOn ? stopVoice : startVoice}
            title={voiceOn ? 'Oprește ascultarea' : 'Comandă vocală (ro-RO)'}
            style={{ display:'flex', alignItems:'center', gap:7, background:voiceOn?'rgba(167,139,250,0.18)':'transparent', border:`1.5px solid ${voiceOn?'#A78BFA':t.border}`, color:voiceOn?'#A78BFA':t.muted, borderRadius:10, padding:'8px 14px', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, transition:'all 0.2s', boxShadow:voiceOn?'0 0 0 3px rgba(167,139,250,0.2)':'none' }}>
            {voiceOn ? '🛑' : '🎤'} {voiceOn ? 'Ascult...' : 'Voce'}
          </button>
          {user.role==='admin' && <PrimaryBtn t={t} icon="+" onClick={() => setShowAdd(true)}>Sarcină Nouă</PrimaryBtn>}
        </div>
      </div>

      {/* Voice feedback */}
      {voiceOn && (
        <div style={{ marginBottom:16, padding:'14px 18px', background:'rgba(167,139,250,0.1)', border:'1.5px solid rgba(167,139,250,0.4)', borderRadius:14, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#A78BFA', animation:'pulse 1s infinite', flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:'#A78BFA', fontWeight:700, marginBottom:3 }}>Ascult... vorbește în română</div>
            <div style={{ fontSize:12, color:t.muted }}>{voiceTxt || 'Ex: „Adaugă sarcină: Depune memoriu APM pentru Raccosta până pe 15 mai"'}</div>
          </div>
        </div>
      )}

      {voiceFb && (
        <div style={{ marginBottom:16, padding:'14px 18px', background:voiceFb.type==='error'?`${t.red}12`:voiceFb.type==='success'?`${t.green}12`:`${t.accent}12`, border:`1.5px solid ${voiceFb.type==='error'?t.red:voiceFb.type==='success'?t.green:t.accent}44`, borderRadius:14, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:18 }}>{voiceFb.type==='error'?'❌':voiceFb.type==='success'?'✅':'🎤'}</span>
          <div style={{ flex:1, fontSize:13, color:t.sub, lineHeight:1.4 }}>{voiceFb.msg}</div>
          {voiceFb.action && (
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={voiceFb.action} style={{ background:t.accent, border:'none', borderRadius:8, padding:'6px 14px', color:t.accentText, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12 }}>Confirmă</button>
              <button onClick={() => setVoiceFb(null)} style={{ background:'transparent', border:`1px solid ${t.border}`, borderRadius:8, padding:'6px 10px', color:t.muted, cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>✕</button>
            </div>
          )}
          {!voiceFb.action && (
            <button onClick={() => setVoiceFb(null)} style={{ background:'transparent', border:'none', color:t.muted, cursor:'pointer', fontSize:16 }}>✕</button>
          )}
        </div>
      )}

      {/* Voice help hint */}
      {!voiceOn && !voiceFb && (
        <div style={{ marginBottom:18, padding:'10px 16px', background:`${t.accent}08`, border:`1px dashed ${t.border}`, borderRadius:10, fontSize:12, color:t.muted }}>
          💡 <strong>Comenzi vocale:</strong> „Adaugă sarcină: [titlu] pentru [persoană] până pe [zi] [lună]" · „Completează sarcina: [titlu]"
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {FILTERS.map(([id,lbl]) => <PillBtn key={id} active={filter===id} onClick={() => setFilter(id)} t={t}>{lbl}</PillBtn>)}
      </div>

      {tasks.length===0 && (
        <Card t={t} style={{ textAlign:'center', padding:'80px 20px' }}>
          <div style={{ fontSize:52, marginBottom:16, opacity:0.5 }}>✅</div>
          <p style={{ fontSize:16, color:t.sub, fontWeight:700, marginBottom:6 }}>Nicio sarcină adăugată</p>
          {user.role==='admin' && <p style={{ fontSize:13, color:t.muted }}>Apasă "Sarcină Nouă" sau creează direct dintr-o procedură</p>}
        </Card>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.length===0 && tasks.length>0 && <p style={{ color:t.muted, fontSize:14, padding:'20px 0' }}>Nicio sarcină în această categorie.</p>}
        {filtered.map(tk => {
          const days     = dLeft(tk.dueDate)
          const proj     = projects.find(p => p.id===tk.projectId)
          const proc     = proj?.procedures.find(p => p.id===tk.procId)
          const isUrgent = days!==null && days<=3 && days>=0 && tk.status!=='completed'
          const isOd     = days!==null && days<0  && tk.status!=='completed'

          return (
            <div key={tk.id} style={{ background:t.card, border:`1px solid ${isOd?t.red+'33':isUrgent?t.orange+'33':t.border}`, borderRadius:16, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, transition:'all 0.15s', boxShadow:t.shadow }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.transform='translateX(3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=isOd?t.red+'33':isUrgent?t.orange+'33':t.border; e.currentTarget.style.transform='translateX(0)' }}>

              <PriorityDot priority={tk.priority} />

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:6, textDecoration:tk.status==='completed'?'line-through':'none', color:tk.status==='completed'?t.muted:t.text }}>
                  {tk.title}
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Avatar userId={tk.assignedTo} size={20} />
                    <span style={{ fontSize:12, color:t.muted }}>{USERS[tk.assignedTo]?.name}</span>
                  </div>
                  {proj && <span style={{ fontSize:12, color:t.muted }}>· {proj.name}</span>}
                  {proc && <span style={{ fontSize:12, color:t.muted }}>· {proc.name}</span>}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                {days!==null && tk.status!=='completed' && (
                  <span style={{ fontSize:12, fontWeight:700, color:isOd?t.red:isUrgent?t.orange:t.muted, background:isOd?`${t.red}18`:isUrgent?`${t.orange}18`:'transparent', padding:'2px 8px', borderRadius:7 }}>
                    {isOd?`-${Math.abs(days)}z`:days===0?'AZI':`${days}z`}
                  </span>
                )}
                <select value={tk.status} onChange={e => onUpdateTaskStatus(tk.id, e.target.value)}
                  style={{ background:t.bg, border:`1.5px solid ${t.border}`, color:t.sub, borderRadius:8, padding:'4px 8px', fontSize:12, cursor:'pointer', outline:'none', fontFamily:'inherit' }}>
                  {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <div style={{ display:'flex', gap:5 }}>
                  <button onClick={() => openWhatsApp(buildWaText(tk, projects))}
                    style={{ display:'flex', alignItems:'center', gap:4, background:'#25D36618', border:'1px solid #25D36655', borderRadius:8, padding:'4px 9px', color:'#25D366', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    💬 WA
                  </button>
                  {user.role==='admin' && <>
                    <button onClick={() => setEditTask(tk)} title="Editează"
                      style={{ width:28, height:28, borderRadius:7, background:`${t.accent}18`, border:`1px solid ${t.accent}44`, color:t.accent, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>✏</button>
                    <button onClick={() => setDelTask(tk)} title="Șterge"
                      style={{ width:28, height:28, borderRadius:7, background:`${t.red}12`, border:`1px solid ${t.red}33`, color:t.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🗑</button>
                  </>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <TaskForm title="Sarcină Nouă" init={EMPTY} projects={projects} t={t}
          onCancel={() => setShowAdd(false)}
          onSave={form => { onAddTask({...form, assignedBy:user.id}); setShowAdd(false) }} />
      )}

      {editTask && (
        <TaskForm title="Editează Sarcina" t={t} projects={projects}
          init={{ title:editTask.title, assignedTo:editTask.assignedTo, dueDate:editTask.dueDate||'', priority:editTask.priority, status:editTask.status, projectId:editTask.projectId||'', procId:editTask.procId||'' }}
          onCancel={() => setEditTask(null)}
          onSave={form => { onUpdateTask(editTask.id, form); setEditTask(null) }} />
      )}

      {delTask && (
        <ConfirmDelete t={t}
          message={`Ștergi sarcina „${delTask.title}"? Acțiunea este permanentă.`}
          onClose={() => setDelTask(null)}
          onConfirm={() => { onDeleteTask(delTask.id); setDelTask(null) }} />
      )}
    </div>
  )
}
