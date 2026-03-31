import { useState, useRef } from 'react'
import { useMobile } from '../hooks/useMobile'
import { Badge, Avatar, StatusSelect, Modal, BtnRow, FormInput } from '../components/UI'
import { USERS, PRIORITY, STATUS, fmt, fmtTs, dLeft, isOD, uid } from '../lib/data'
import { useVoice } from '../hooks/useVoice'

// ── helpers ───────────────────────────────────────────────────────
function fileIcon(name) {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (['pdf'].includes(ext)) return '📕'
  if (['doc','docx'].includes(ext)) return '📘'
  if (['xls','xlsx','csv'].includes(ext)) return '📗'
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return '🖼'
  if (['zip','rar','7z'].includes(ext)) return '🗜'
  if (['dwg','dxf'].includes(ext)) return '📐'
  return '📄'
}
function fmtSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(1)} MB`
}

// ── Add Task Modal ────────────────────────────────────────────────
function AddTaskModal({ user, projectId, procId, onAdd, onClose, t, initData }) {
  const [form, setForm] = useState(initData ? {
    title: initData.title, assignedTo: initData.assignedTo,
    dueDate: initData.dueDate||'', priority: initData.priority
  } : { title:'', assignedTo:'raccosta', dueDate:'', priority:'medium' })
  const submit = () => {
    if (!form.title.trim()) return
    onAdd({ ...form, projectId, procId, assignedBy: user.id, status: 'pending' })
    onClose()
  }
  const sel = (label, field, opts) => (
    <div>
      <label style={{ display:'block', color:t.muted, fontSize:11, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.6px' }}>{label}</label>
      <select value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
        style={{ width:'100%', background:t.bg, border:`1.5px solid ${t.border}`, borderRadius:10, padding:'10px 12px', color:t.text, fontSize:13, outline:'none', cursor:'pointer', fontFamily:'inherit' }}>
        {opts.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  )
  return (
    <Modal title="Sarcină Nouă" onClose={onClose} maxWidth={460} t={t}>
      <FormInput label="Descriere *" textarea rows={3} t={t} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        {sel('Asignat la', 'assignedTo', Object.values(USERS).map(u => [u.id, u.name]))}
        {sel('Prioritate', 'priority', Object.entries(PRIORITY).map(([k,v]) => [k, v.label]))}
      </div>
      <FormInput label="Termen Limită" type="date" t={t} value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} />
      <BtnRow t={t} onCancel={onClose} onSave={submit} saveLabel="Adaugă Sarcină" />
    </Modal>
  )
}

// ── Confirm delete modal ──────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onClose, t }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:24, backdropFilter:'blur(4px)' }}>
      <div style={{ background:t.card, border:`1px solid ${t.red}55`, borderRadius:20, padding:32, width:'100%', maxWidth:400, animation:'fadeIn 0.2s ease', boxShadow:t.shadow }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${t.red}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🗑</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:4 }}>{title}</div>
            <div style={{ fontSize:13, color:t.muted, lineHeight:1.4 }}>{message}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1, background:'transparent', border:`1.5px solid ${t.border}`, color:t.sub, borderRadius:10, padding:'11px', cursor:'pointer', fontWeight:600, fontFamily:'inherit', fontSize:14 }}>
            Anulare
          </button>
          <button onClick={onConfirm}
            style={{ flex:1, background:`linear-gradient(135deg,${t.red},#B91C1C)`, border:'none', color:'#fff', borderRadius:10, padding:'11px', cursor:'pointer', fontWeight:700, fontFamily:'inherit', fontSize:14, boxShadow:`0 4px 14px ${t.red}44` }}>
            Șterge
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── OVERVIEW TAB ─────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
function OverviewTab({ user, project, tasks, t, onSelectProc, onAddProcedure, onUpdateProcedure, onDeleteProcedure, onAddDocument, onDeleteDocument, targetPct, onSetTarget }) {
  const isMobile = useMobile()
  const fileRefs = useRef({})
  const [editTarget, setEditTarget]   = useState(false)
  const [targetInput, setTargetInput] = useState(String(targetPct))
  const [showAddP, setShowAddP]       = useState(false)
  const [newPName, setNewPName]       = useState('')
  const [confirmDel, setConfirmDel]   = useState(null) // { id, name }

  const total    = project.procedures.length
  const done     = project.procedures.filter(p => p.status === 'completed').length
  const inProg   = project.procedures.filter(p => p.status === 'in_progress').length
  const flagged  = project.procedures.filter(p => p.flagged).length
  const pct      = total > 0 ? Math.round(done / total * 100) : 0
  const allDocs  = project.procedures.flatMap(pr => pr.docs.map(d => ({...d, procName: pr.name})))
  const gaugeColor = pct >= targetPct ? t.green : pct >= targetPct * 0.6 ? t.orange : t.red

  return (
    <div style={{ flex:1, overflow:'auto', padding:isMobile?'16px 14px':'28px 32px', color:t.text }}>

      {/* ── Summary row ─────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'280px 1fr', gap:isMobile?16:24, marginBottom:24 }}>

        {/* Donut progress */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:20, padding:28, display:'flex', flexDirection:'column', alignItems:'center', boxShadow:t.shadow }}>
          <div style={{ position:'relative', width:140, height:140, marginBottom:16 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke={t.border} strokeWidth="12" />
              <circle cx="70" cy="70" r="58" fill="none" stroke={gaugeColor} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*58*pct/100} ${2*Math.PI*58}`}
                transform="rotate(-90 70 70)" style={{ transition:'stroke-dasharray 0.8s ease, stroke 0.4s' }} />
              {targetPct > 0 && (
                <circle cx="70" cy="70" r="58" fill="none" stroke={t.accent} strokeWidth="3"
                  strokeDasharray={`2 ${2*Math.PI*58-2}`}
                  transform={`rotate(${-90+360*targetPct/100} 70 70)`} opacity="0.7" />
              )}
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:32, fontWeight:800, color:gaugeColor, lineHeight:1 }}>{pct}%</span>
              <span style={{ fontSize:11, color:t.muted, fontWeight:600, marginTop:2 }}>finalizat</span>
            </div>
          </div>
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
            {[['Finalizate', done, t.green],['În lucru', inProg, t.orange],['Rămase', total-done-inProg, t.muted],['Probleme', flagged, t.red]].map(([lbl,val,col]) => (
              <div key={lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, color:t.muted }}>{lbl}</span>
                <span style={{ fontSize:14, fontWeight:700, color: val>0?col:t.muted }}>{val}</span>
              </div>
            ))}
            <div style={{ height:1, background:t.border, margin:'4px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:t.muted }}>Target</span>
              {editTarget ? (
                <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                  <input type="number" min="0" max="100" value={targetInput}
                    onChange={e => setTargetInput(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){ onSetTarget(Number(targetInput)); setEditTarget(false) } }}
                    style={{ width:52, background:t.bg, border:`1.5px solid ${t.accent}`, borderRadius:6, padding:'3px 6px', color:t.text, fontSize:12, outline:'none', fontFamily:'inherit', textAlign:'right' }} autoFocus />
                  <span style={{ fontSize:12, color:t.muted }}>%</span>
                  <button onClick={() => { onSetTarget(Number(targetInput)); setEditTarget(false) }}
                    style={{ background:t.accent, border:'none', borderRadius:5, color:t.accentText, fontSize:11, padding:'3px 7px', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>✓</button>
                </div>
              ) : (
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <span style={{ fontSize:14, fontWeight:700, color:t.accent }}>{targetPct}%</span>
                  {user.role==='admin' && (
                    <button onClick={() => { setTargetInput(String(targetPct)); setEditTarget(true) }}
                      style={{ background:'none', border:'none', cursor:'pointer', color:t.muted, fontSize:13, padding:'0 2px' }}>✏</button>
                  )}
                </div>
              )}
            </div>
            <div style={{ marginTop:6 }}>
              <div style={{ height:8, background:t.bg, borderRadius:99, overflow:'visible', position:'relative' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:gaugeColor, borderRadius:99, transition:'width 0.6s ease' }} />
                {targetPct > 0 && (
                  <div style={{ position:'absolute', top:-4, left:`${targetPct}%`, transform:'translateX(-50%)', width:2, height:16, background:t.accent, borderRadius:1 }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:'18px 22px', display:'flex', alignItems:'center', gap:16, boxShadow:t.shadow }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${t.blue}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📁</div>
            <div><div style={{ fontSize:28, fontWeight:800, color:t.blue, lineHeight:1 }}>{allDocs.length}</div><div style={{ fontSize:13, color:t.muted, marginTop:3 }}>Documente încărcate</div></div>
          </div>
          {(() => {
            const od = project.procedures.filter(p => isOD(p.deadline) && p.status!=='completed').length
            return (
              <div style={{ background:t.card, border:`1px solid ${od>0?t.red+'44':t.border}`, borderRadius:16, padding:'18px 22px', display:'flex', alignItems:'center', gap:16, boxShadow:t.shadow }}>
                <div style={{ width:48, height:48, borderRadius:14, background:od>0?`${t.red}22`:`${t.green}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{od>0?'⚠️':'✅'}</div>
                <div><div style={{ fontSize:28, fontWeight:800, color:od>0?t.red:t.green, lineHeight:1 }}>{od}</div><div style={{ fontSize:13, color:t.muted, marginTop:3 }}>{od>0?'Termene depășite':'Fără depășiri'}</div></div>
              </div>
            )
          })()}
          {(() => {
            const next = project.procedures.filter(p => p.deadline && p.status!=='completed').sort((a,b) => new Date(a.deadline)-new Date(b.deadline))[0]
            if (!next) return null
            const days = dLeft(next.deadline)
            return (
              <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:'18px 22px', display:'flex', alignItems:'center', gap:16, boxShadow:t.shadow }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${t.orange}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📅</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{next.name}</div>
                  <div style={{ fontSize:12, color:days!==null&&days<=7?t.orange:t.muted }}>{fmt(next.deadline)}{days!==null?` · ${days<0?`${Math.abs(days)}z dep.`:`${days}z rămase`}`:''}</div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ── Procedures table ─────────────────────────────────────── */}
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:20, overflow:'hidden', boxShadow:t.shadow, marginBottom:24 }}>
        {/* Header */}
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'12px 1fr 120px':'28px 1fr 130px 140px 80px 160px', gap:0, padding:'11px 18px', background:t.bg, borderBottom:`1px solid ${t.border}` }}>
          {['','Aviz / Procedură','Status','Termen','Docs','Acțiuni'].map((h,i) => (
            <div key={i} style={{ fontSize:11, fontWeight:700, color:t.muted, textTransform:'uppercase', letterSpacing:'0.6px', textAlign:i>1?'center':'left' }}>{h}</div>
          ))}
        </div>

        {project.procedures.length === 0 && (
          <div style={{ padding:'40px 20px', textAlign:'center', color:t.muted }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
            <p style={{ margin:0, fontSize:14 }}>Nicio procedură. Adaugă prima procedură mai jos.</p>
          </div>
        )}

        {project.procedures.map((proc, idx) => {
          const od     = isOD(proc.deadline) && proc.status !== 'completed'
          const dl     = dLeft(proc.deadline)
          const isLast = idx === project.procedures.length - 1
          const flagged= proc.flagged === true
          // Row background: flagged > overdue > normal
          const rowBg  = flagged ? `${t.red}10` : od ? `${t.red}06` : 'transparent'
          const hoverBg= flagged ? `${t.red}18` : od ? `${t.red}12` : `${t.accent}08`

          return (
            <div key={proc.id}
              style={{ display:'grid', gridTemplateColumns:isMobile?'12px 1fr 120px':'28px 1fr 130px 140px 80px 160px', gap:0, padding:'13px 18px', borderBottom:isLast?'none':`1px solid ${t.border}`, background:rowBg, transition:'background 0.15s', alignItems:'center',
                // flagged: full left border red
                borderLeft: flagged ? `4px solid ${t.red}` : '4px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background=hoverBg}
              onMouseLeave={e => e.currentTarget.style.background=rowBg}>

              {/* Status dot */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:
                  proc.status==='completed'?t.green : proc.status==='in_progress'?t.orange :
                  proc.status==='overdue'||od?t.red : t.muted }} />
              </div>

              {/* Name — clickable */}
              <div style={{ minWidth:0, paddingRight:8 }}>
                <button onClick={() => onSelectProc(proc.id)}
                  style={{ background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left', fontFamily:'inherit', width:'100%' }}>
                  <div style={{ fontSize:14, fontWeight:600, color:proc.status==='completed'?t.muted:t.text,
                    textDecoration:proc.status==='completed'?'line-through':'none',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    display:'flex', alignItems:'center', gap:8 }}>
                    {flagged && <span style={{ flexShrink:0, fontSize:13 }}>🚩</span>}
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}
                      onMouseEnter={e => { e.currentTarget.style.color=t.accent; e.currentTarget.style.textDecoration='underline' }}
                      onMouseLeave={e => { e.currentTarget.style.color=proc.status==='completed'?t.muted:t.text; e.currentTarget.style.textDecoration=proc.status==='completed'?'line-through':'none' }}>
                      {proc.name}
                    </span>
                  </div>
                  {proc.comments.length > 0 && (
                    <div style={{ fontSize:11, color:t.muted, marginTop:2 }}>💬 {proc.comments.length} comentariu{proc.comments.length!==1?'':''}</div>
                  )}
                </button>
              </div>

              {/* Status select */}
              <div style={{ textAlign:'center' }}>
                <select value={proc.status} onChange={e => onUpdateProcedure(project.id, proc.id, pr => ({...pr, status:e.target.value}))}
                  style={{ background:'transparent', border:'none', color:STATUS[proc.status]?.color||t.sub, fontSize:12, fontWeight:700, cursor:'pointer', outline:'none', fontFamily:'inherit', width:'100%', textAlign:'center' }}>
                  {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              {/* Deadline */}
              <div style={{ textAlign:'center' }}>
                <input type="date" value={proc.deadline||''} onChange={e => onUpdateProcedure(project.id, proc.id, pr => ({...pr, deadline:e.target.value}))}
                  style={{ background:'transparent', border:'none', color:od?t.red:dl!==null&&dl<=7?t.orange:t.sub, fontSize:12, fontWeight:od||(dl!==null&&dl<=7)?700:400, cursor:'pointer', outline:'none', fontFamily:'inherit', textAlign:'center', width:'100%' }} />
                {od && <div style={{ fontSize:10, color:t.red, fontWeight:700, marginTop:1 }}>+{Math.abs(dl)}z dep.</div>}
                {!od && dl!==null && dl<=7 && dl>=0 && <div style={{ fontSize:10, color:t.orange, marginTop:1 }}>{dl}z rămase</div>}
              </div>

              {/* Docs */}
              <div style={{ textAlign:'center' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:proc.docs.length>0?`${t.blue}18`:`${t.border}40`, borderRadius:8, padding:'4px 9px' }}>
                  <span style={{ fontSize:12 }}>📄</span>
                  <span style={{ fontSize:13, fontWeight:700, color:proc.docs.length>0?t.blue:t.muted }}>{proc.docs.length}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}>

                {/* Upload — more visible */}
                <button onClick={() => fileRefs.current[proc.id]?.click()} title="Încarcă document"
                  style={{ display:'flex', alignItems:'center', gap:5, background:t.accentGrad||t.accent, border:'none', borderRadius:8, padding:'6px 10px', color:t.accentText, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit', boxShadow:`0 3px 10px ${t.accent}44`, whiteSpace:'nowrap' }}>
                  ↑ Doc
                </button>
                <input ref={el => fileRefs.current[proc.id]=el} type="file" multiple
                  onChange={e => { Array.from(e.target.files).forEach(f => onAddDocument(project.id, proc.id, f)) }}
                  style={{ display:'none' }} />

                {/* Flag / probleme */}
                <button onClick={() => onUpdateProcedure(project.id, proc.id, pr => ({...pr, flagged:!pr.flagged}))}
                  title={flagged ? 'Elimină marcaj problemă' : 'Marchează ca problemă'}
                  style={{ width:30, height:30, borderRadius:8, background:flagged?`${t.red}25`:`${t.border}40`, border:`1px solid ${flagged?t.red+'66':t.border}`, color:flagged?t.red:t.muted, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, transition:'all 0.15s', transform:flagged?'scale(1.1)':'scale(1)' }}>
                  🚩
                </button>

                {/* Delete — admin only */}
                {user.role==='admin' && (
                  <button onClick={() => setConfirmDel({ id:proc.id, name:proc.name })}
                    title="Șterge procedura"
                    style={{ width:30, height:30, borderRadius:8, background:`${t.red}12`, border:`1px solid ${t.red}33`, color:t.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                    🗑
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Add procedure */}
        {user.role==='admin' && (
          <div style={{ borderTop:`1px dashed ${t.border}` }}>
            {showAddP ? (
              <div style={{ display:'flex', gap:10, padding:'12px 20px', alignItems:'center' }}>
                <input autoFocus value={newPName} onChange={e => setNewPName(e.target.value)}
                  onKeyDown={e => {
                    if(e.key==='Enter' && newPName.trim()){ onAddProcedure(project.id, newPName); setNewPName(''); setShowAddP(false) }
                    if(e.key==='Escape') setShowAddP(false)
                  }}
                  placeholder="Denumire procedură / aviz..."
                  style={{ flex:1, background:t.bg, border:`1.5px solid ${t.accent}`, borderRadius:8, padding:'8px 12px', color:t.text, fontSize:13, outline:'none', fontFamily:'inherit' }} />
                <button onClick={() => { if(newPName.trim()){ onAddProcedure(project.id, newPName); setNewPName(''); setShowAddP(false) } }}
                  style={{ background:t.accentGrad||t.accent, border:'none', borderRadius:8, padding:'8px 16px', color:t.accentText, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Adaugă</button>
                <button onClick={() => { setShowAddP(false); setNewPName('') }} style={{ background:'none', border:'none', color:t.muted, cursor:'pointer', fontSize:18 }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setShowAddP(true)}
                style={{ width:'100%', padding:'12px 20px', background:'none', border:'none', color:t.muted, cursor:'pointer', fontSize:13, fontFamily:'inherit', textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>＋</span> Adaugă aviz / procedură
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── All documents table ──────────────────────────────────── */}
      {allDocs.length > 0 && (
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:20, overflow:'hidden', boxShadow:t.shadow }}>
          <div style={{ padding:'16px 24px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`${t.blue}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>📁</div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:t.text }}>Toate Documentele</div>
              <div style={{ fontSize:12, color:t.muted }}>{allDocs.length} fișier{allDocs.length!==1?'e':''} · {project.procedures.filter(p=>p.docs.length>0).length} proceduri</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'36px 1fr 160px 100px 80px 90px', padding:'10px 20px', background:t.bg, borderBottom:`1px solid ${t.border}` }}>
            {['','Fișier','Procedură','Mărime','Încărcat',''].map((h,i) => (
              <div key={i} style={{ fontSize:11, fontWeight:700, color:t.muted, textTransform:'uppercase', letterSpacing:'0.6px' }}>{h}</div>
            ))}
          </div>
          {allDocs.map((doc, idx) => (
            <div key={doc.id}
              style={{ display:'grid', gridTemplateColumns:'36px 1fr 160px 100px 80px 90px', padding:'12px 20px', borderBottom:idx<allDocs.length-1?`1px solid ${t.border}`:'none', alignItems:'center', transition:'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background=`${t.accent}08`}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{ fontSize:20 }}>{fileIcon(doc.name)}</div>
              <div style={{ minWidth:0, paddingRight:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:t.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</div>
              </div>
              <div style={{ fontSize:12, color:t.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.procName}</div>
              <div style={{ fontSize:12, color:t.muted }}>{fmtSize(doc.size)}</div>
              <div>{doc.uploadedBy ? <Avatar userId={doc.uploadedBy} size={22} /> : <span style={{ fontSize:11, color:t.muted }}>—</span>}</div>
              <div style={{ display:'flex', gap:6, alignItems:'center', justifyContent:'flex-end' }}>
                {doc.url && (
                  <a href={doc.url} download={doc.name} target="_blank" rel="noreferrer" title="Descarcă"
                    style={{ width:30, height:30, borderRadius:8, background:`${t.blue}18`, border:`1px solid ${t.blue}44`, color:t.blue, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontSize:15 }}>↓</a>
                )}
                <button title="Șterge" onClick={() => { const proc = project.procedures.find(p => p.docs.some(d => d.id===doc.id)); if(proc) onDeleteDocument(project.id, proc.id, doc.id) }}
                  style={{ width:30, height:30, borderRadius:8, background:`${t.red}12`, border:`1px solid ${t.red}33`, color:t.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDel && (
        <ConfirmModal
          title="Șterge procedura?"
          message={`„${confirmDel.name}" va fi ștearsă permanent împreună cu toate documentele și comentariile asociate.`}
          t={t}
          onClose={() => setConfirmDel(null)}
          onConfirm={() => { onDeleteProcedure(project.id, confirmDel.id); setConfirmDel(null) }}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── PROCEDURE PANEL ──────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
function ProcPanel({ user, proc, project, tasks, onUpdate, onAddComment, onAddDocument, onDeleteDocument, onAddTask, onUpdateTaskStatus, onUpdateTask, onDeleteTask, t }) {
  const isMobile = useMobile()
  const [comment, setComment]         = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [editTask,    setEditTask]    = useState(null)
  const [delTask,     setDelTask]     = useState(null)
  const fileRef = useRef(null)
  const { listening, start, stop }  = useVoice(txt => setComment(c => c + (c?' ':'') + txt))
  const procTasks = tasks.filter(tk => tk.procId === proc.id)
  const dl = dLeft(proc.deadline)
  const isFlagged = proc.flagged === true

  return (
    <div style={{ flex:1, overflow:'auto', padding:isMobile?'16px 14px':'24px 32px', color:t.text }}>

      {/* Flagged banner */}
      {isFlagged && (
        <div style={{ display:'flex', alignItems:'center', gap:12, background:`${t.red}18`, border:`1px solid ${t.red}44`, borderRadius:14, padding:'12px 18px', marginBottom:20 }}>
          <span style={{ fontSize:20 }}>🚩</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.red }}>Procedură marcată cu problemă</div>
            <div style={{ fontSize:12, color:t.muted, marginTop:2 }}>Această procedură a fost semnalată ca necesitând atenție. Rezolvați problema și eliminați marcajul din Prezentare Generală.</div>
          </div>
          <button onClick={() => onUpdate(proc.id, pr => ({...pr, flagged:false}))}
            style={{ background:`${t.red}22`, border:`1px solid ${t.red}44`, borderRadius:8, padding:'6px 12px', color:t.red, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
            Rezolvat ✓
          </button>
        </div>
      )}

      {/* Info bar */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', marginBottom:24, padding:'18px 22px', background:t.card, borderRadius:18, border:`1px solid ${isFlagged?t.red+'55':t.border}`, boxShadow:isFlagged?`0 0 0 2px ${t.red}22`:t.shadow }}>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ fontSize:18, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:10 }}>
            {isFlagged && <span style={{ color:t.red }}>🚩</span>}
            {proc.name}
          </div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
            <Badge status={proc.status} />
            {proc.deadline && (
              <span style={{ display:'flex', alignItems:'center', gap:6, color:isOD(proc.deadline)&&proc.status!=='completed'?t.red:t.muted, fontSize:13 }}>
                📅 {fmt(proc.deadline)}
                {isOD(proc.deadline)&&proc.status!=='completed'
                  ? <strong style={{ color:t.red }}>({Math.abs(dl)}z dep.!)</strong>
                  : dl!==null ? <span style={{ color:dl<=7?t.orange:t.muted }}>({dl}z)</span> : null}
              </span>
            )}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <StatusSelect t={t} value={proc.status} onChange={e => onUpdate(proc.id, pr => ({...pr, status:e.target.value}))} />
          <input type="date" value={proc.deadline||''} onChange={e => onUpdate(proc.id, pr => ({...pr, deadline:e.target.value}))}
            style={{ background:t.bg, border:`1.5px solid ${t.border}`, color:t.sub, borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', fontFamily:'inherit' }} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Documents */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:18, padding:22, boxShadow:t.shadow }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:`${t.blue}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>📄</div>
              <h3 style={{ fontSize:14, fontWeight:700, margin:0, color:t.text }}>Documente <span style={{ color:t.muted, fontWeight:400 }}>({proc.docs.length})</span></h3>
            </div>
            {/* Upload button — prominent */}
            <button onClick={() => fileRef.current.click()}
              style={{ display:'flex', alignItems:'center', gap:6, background:t.accentGrad||t.accent, color:t.accentText, border:'none', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 4px 12px ${t.accent}44` }}>
              ↑ Încarcă doc.
            </button>
            <input ref={fileRef} type="file" multiple onChange={e => Array.from(e.target.files).forEach(f => onAddDocument(project.id, proc.id, f))} style={{ display:'none' }} />
          </div>

          {proc.docs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px 16px', border:`2px dashed ${t.border}`, borderRadius:12, cursor:'pointer' }} onClick={() => fileRef.current.click()}>
              <div style={{ fontSize:28, marginBottom:8, opacity:0.5 }}>📁</div>
              <p style={{ color:t.muted, fontSize:13, margin:0 }}>Click sau trage fișiere aici</p>
            </div>
          ) : (
            proc.docs.map(doc => (
              <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:`1px solid ${t.border}44` }}>
                <div style={{ width:34, height:34, background:`${t.blue}15`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{fileIcon(doc.name)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:t.text }}>{doc.name}</div>
                  <div style={{ fontSize:11, color:t.muted }}>{fmtSize(doc.size)} · {USERS[doc.uploadedBy]?.name?.split(' ')[0] || '—'}</div>
                </div>
                {doc.url && (
                  <a href={doc.url} download={doc.name} target="_blank" rel="noreferrer" title="Descarcă"
                    style={{ width:28, height:28, borderRadius:7, background:`${t.blue}18`, border:`1px solid ${t.blue}44`, color:t.blue, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontSize:14, flexShrink:0 }}>↓</a>
                )}
                <button onClick={() => onDeleteDocument(project.id, proc.id, doc.id)}
                  style={{ width:28, height:28, borderRadius:7, background:`${t.red}12`, border:`1px solid ${t.red}33`, color:t.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🗑</button>
              </div>
            ))
          )}
        </div>

        {/* Comments */}
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:18, padding:22, display:'flex', flexDirection:'column', boxShadow:t.shadow }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:`${t.purple||'#8B5CF6'}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>💬</div>
            <h3 style={{ fontSize:14, fontWeight:700, margin:0, color:t.text }}>Comentarii <span style={{ color:t.muted, fontWeight:400 }}>({proc.comments.length})</span></h3>
          </div>
          <div style={{ flex:1, overflow:'auto', marginBottom:14, maxHeight:200, minHeight:60 }}>
            {proc.comments.length===0 && <p style={{ color:t.muted, fontSize:13 }}>Niciun comentariu.</p>}
            {proc.comments.map(c => (
              <div key={c.id} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                  <Avatar userId={c.author} size={22} />
                  <span style={{ fontSize:12, fontWeight:600, color:t.sub }}>{USERS[c.author]?.name}</span>
                  {c.voice && <span style={{ color:'#A78BFA', fontSize:10 }}>🎤</span>}
                  <span style={{ fontSize:10, color:t.muted, marginLeft:'auto' }}>{fmtTs(c.ts)}</span>
                </div>
                <div style={{ background:t.bg, borderRadius:10, padding:'9px 13px', fontSize:13, color:t.sub, lineHeight:1.5, marginLeft:29 }}>{c.text}</div>
              </div>
            ))}
          </div>
          <div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Scrie un comentariu..." rows={2}
              style={{ width:'100%', background:t.bg, border:`1.5px solid ${t.border}`, borderRadius:10, padding:'9px 13px', color:t.text, fontSize:13, outline:'none', resize:'none', fontFamily:'inherit', marginBottom:8 }} />
            <div style={{ display:'flex', gap:7 }}>
              <button onClick={listening?stop:start}
                style={{ display:'flex', alignItems:'center', gap:5, background:listening?'rgba(167,139,250,0.15)':t.bg, border:`1.5px solid ${listening?'#A78BFA':t.border}`, color:listening?'#A78BFA':t.muted, borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                {listening?'🛑':' 🎤'}
              </button>
              <button onClick={() => { if(!comment.trim()) return; onAddComment(project.id, proc.id, comment, user.id, false); setComment('') }}
                disabled={!comment.trim()}
                style={{ flex:1, background:comment.trim()?t.accentGrad||t.accent:'transparent', border:`1.5px solid ${comment.trim()?t.accent:t.border}`, color:comment.trim()?t.accentText:t.muted, borderRadius:8, padding:'7px', fontSize:13, fontWeight:700, cursor:comment.trim()?'pointer':'default', fontFamily:'inherit', boxShadow:comment.trim()?`0 4px 12px ${t.accent}44`:'none' }}>
                Trimite
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:18, padding:22, boxShadow:t.shadow }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:`${t.green}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✅</div>
            <h3 style={{ fontSize:14, fontWeight:700, margin:0, color:t.text }}>Sarcini <span style={{ color:t.muted, fontWeight:400 }}>({procTasks.length})</span></h3>
          </div>
          {user.role==='admin' && (
            <button onClick={() => setShowAddTask(true)}
              style={{ display:'flex', alignItems:'center', gap:5, background:`${t.green}18`, color:t.green, border:`1px solid ${t.green}44`, borderRadius:9, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              ＋ Sarcină
            </button>
          )}
        </div>
        {procTasks.length===0 && <p style={{ color:t.muted, fontSize:13, margin:0 }}>Nicio sarcină.</p>}
        {procTasks.map(tk => {
          const days = dLeft(tk.dueDate)
          const p = PRIORITY[tk.priority]||PRIORITY.medium
          return (
            <div key={tk.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:`1px solid ${t.border}44` }}>
              <div style={{ width:3, height:38, borderRadius:99, background:p.color, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:4, color:t.text }}>{tk.title}</div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <Avatar userId={tk.assignedTo} size={18} />
                  <span style={{ fontSize:11, color:t.muted }}>{USERS[tk.assignedTo]?.name}</span>
                  <Badge status={tk.status} />
                  {days!==null && <span style={{ fontSize:11, color:days<0?t.red:days<=3?t.orange:t.muted }}>{days<0?`+${Math.abs(days)}z dep.`:days===0?'AZI':`${days}z`}</span>}
                </div>
              </div>
              <select value={tk.status} onChange={e => onUpdateTaskStatus(tk.id, e.target.value)}
                style={{ background:t.bg, border:`1.5px solid ${t.border}`, color:t.sub, borderRadius:7, padding:'4px 8px', fontSize:11, cursor:'pointer', outline:'none', fontFamily:'inherit' }}>
                {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              {user.role==='admin' && (
                <div style={{ display:'flex', gap:4 }}>
                  <button onClick={() => setEditTask(tk)} title="Editează"
                    style={{ width:26, height:26, borderRadius:6, background:`${t.accent}18`, border:`1px solid ${t.accent}44`, color:t.accent, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>✏</button>
                  <button onClick={() => setDelTask(tk)} title="Șterge"
                    style={{ width:26, height:26, borderRadius:6, background:`${t.red}12`, border:`1px solid ${t.red}33`, color:t.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🗑</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showAddTask && <AddTaskModal user={user} projectId={project.id} procId={proc.id} onAdd={onAddTask} onClose={() => setShowAddTask(false)} t={t} />}

      {editTask && (
        <AddTaskModal user={user} projectId={project.id} procId={proc.id} t={t}
          initData={editTask}
          onAdd={form => { onUpdateTask(editTask.id, form); setEditTask(null) }}
          onClose={() => setEditTask(null)} />
      )}

      {delTask && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:24, backdropFilter:'blur(4px)' }}>
          <div style={{ background:t.card, border:`1px solid ${t.red}55`, borderRadius:20, padding:32, width:'100%', maxWidth:380, boxShadow:t.shadow }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${t.red}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🗑</div>
              <div style={{ fontSize:14, color:t.sub, lineHeight:1.4 }}>Ștergi sarcina „{delTask.title}"?</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDelTask(null)} style={{ flex:1, background:'transparent', border:`1.5px solid ${t.border}`, color:t.sub, borderRadius:10, padding:11, cursor:'pointer', fontWeight:600, fontFamily:'inherit', fontSize:14 }}>Anulare</button>
              <button onClick={() => { onDeleteTask(delTask.id); setDelTask(null) }} style={{ flex:1, background:`linear-gradient(135deg,${t.red},#B91C1C)`, border:'none', color:'#fff', borderRadius:10, padding:11, cursor:'pointer', fontWeight:700, fontFamily:'inherit', fontSize:14 }}>Șterge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// ── MAIN EXPORT ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
export default function ProjectDetail({ user, project, tasks, onBack, onAddProcedure, onUpdateProcedure, onDeleteProcedure, onAddComment, onAddDocument, onDeleteDocument, onAddTask, onUpdateTaskStatus, onUpdateTask, onDeleteTask, initialProcId, t }) {
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState(initialProcId || 'overview')
  const [editId, setEditId]       = useState(null)
  const [editName, setEditName]   = useState('')
  const [hovId, setHovId]         = useState(null)
  const [toast, setToast]         = useState(null)
  const [target, setTarget]       = useState(() => {
    try { return parseInt(localStorage.getItem(`autorizact_target_${project.id}`)||'80') } catch { return 80 }
  })

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const handleSetTarget = val => {
    const v = Math.max(0, Math.min(100, val||0))
    setTarget(v)
    try { localStorage.setItem(`autorizact_target_${project.id}`, String(v)) } catch {}
    showToast(`Target setat: ${v}%`)
  }

  const saveTab = id => {
    if (editName.trim()) { onUpdateProcedure(project.id, id, pr => ({...pr, name:editName})); showToast('Redenumit ✓') }
    setEditId(null)
  }

  const selProc = project.procedures.find(p => p.id === activeTab)
  const total   = project.procedures.length
  const done    = project.procedures.filter(p => p.status==='completed').length
  const pct     = total > 0 ? Math.round(done/total*100) : 0
  const flaggedCount = project.procedures.filter(p => p.flagged).length

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', color:t.text }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:'12px 20px', fontSize:13, color:t.sub, zIndex:200, boxShadow:t.shadow, animation:'fadeIn 0.25s ease', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ color:t.green }}>✓</span> {toast}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ background:t.card, borderBottom:`1px solid ${t.border}`, padding:isMobile?'10px 16px 0':'18px 28px 0', flexShrink:0, boxShadow:`0 2px 8px rgba(0,0,0,0.1)` }}>

        {/* Back + progress row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: isMobile ? 8 : 14 }}>
          <button onClick={onBack} style={{ background:'none', border:'none', color:t.muted, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13, padding:0, fontFamily:'inherit', fontWeight:500 }}>
            ‹ Proiecte
          </button>
          {/* Progress compact — always visible */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {flaggedCount > 0 && (
              <span style={{ fontSize:11, color:t.red, fontWeight:700, background:`${t.red}18`, padding:'2px 8px', borderRadius:6 }}>🚩 {flaggedCount}</span>
            )}
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize: isMobile ? 16 : 22, fontWeight:800, color:pct>=target?t.green:pct>=target*0.6?t.orange:t.red, lineHeight:1 }}>{pct}%</div>
              <div style={{ fontSize:9, color:t.muted, fontWeight:600 }}>din {target}%</div>
            </div>
            <div style={{ width: isMobile?36:48, height: isMobile?36:48 }}>
              <svg width={isMobile?36:48} height={isMobile?36:48} viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" fill="none" stroke={t.border} strokeWidth="5" />
                <circle cx="24" cy="24" r="19" fill="none"
                  stroke={pct>=target?t.green:pct>=target*0.6?t.orange:t.red}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*19*pct/100} ${2*Math.PI*19}`}
                  transform="rotate(-90 24 24)" />
              </svg>
            </div>
            <Badge status={project.status} />
          </div>
        </div>

        {/* Title — truncated on mobile */}
        {isMobile ? (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:15, fontWeight:800, color:t.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:4 }}>{project.name}</div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'nowrap', overflow:'hidden' }}>
              <span style={{ fontSize:10, color:t.accent, fontWeight:700, fontFamily:"'DM Mono',monospace", background:`${t.accent}18`, padding:'1px 7px', borderRadius:5, flexShrink:0 }}>{project.certificat}</span>
              <span style={{ fontSize:11, color:t.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>⏰ {fmt(project.dataExpirare)}</span>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.4px', margin:'0 0 8px' }}>{project.name}</h1>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:11, color:t.accent, fontWeight:700, fontFamily:"'DM Mono',monospace", background:`${t.accent}18`, padding:'2px 9px', borderRadius:6 }}>{project.certificat}</span>
                <span style={{ fontSize:12, color:t.muted }}>📍 {project.address}</span>
                <span style={{ fontSize:12, color:t.muted }}>⏰ Exp: {fmt(project.dataExpirare)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', alignItems:'flex-end', overflowX:'auto' }}>
          {/* Overview */}
          <div style={{ borderBottom:`3px solid ${activeTab==='overview'?t.accent:'transparent'}`, flexShrink:0 }}>
            <button onClick={() => setActiveTab('overview')}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', background:'none', border:'none', cursor:'pointer', color:activeTab==='overview'?t.accent:t.sub, fontSize:13, fontWeight:activeTab==='overview'?700:400, fontFamily:'inherit', whiteSpace:'nowrap' }}>
              <span>📋</span> Prezentare Generală
              {flaggedCount > 0 && (
                <span style={{ background:t.red, color:'#fff', borderRadius:99, fontSize:10, fontWeight:800, padding:'1px 6px', marginLeft:2 }}>{flaggedCount}</span>
              )}
            </button>
          </div>

          {/* Procedure tabs */}
          {project.procedures.map(proc => {
            const act      = activeTab === proc.id
            const od       = isOD(proc.deadline) && proc.status !== 'completed'
            const flagged  = proc.flagged === true
            return (
              <div key={proc.id} style={{ borderBottom:`3px solid ${act?t.accent:'transparent'}`, flexShrink:0 }}>
                {editId===proc.id ? (
                  <div style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 4px' }}>
                    <input autoFocus value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key==='Enter'&&saveTab(proc.id)}
                      style={{ background:t.bg, border:`1.5px solid ${t.accent}`, borderRadius:6, padding:'4px 8px', color:t.text, fontSize:13, width:150, outline:'none', fontFamily:'inherit' }} />
                    <button onClick={() => saveTab(proc.id)} style={{ background:'none', border:'none', color:t.green, cursor:'pointer', fontSize:16 }}>✓</button>
                    <button onClick={() => setEditId(null)} style={{ background:'none', border:'none', color:t.muted, cursor:'pointer', fontSize:16 }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setActiveTab(proc.id)}
                    onMouseEnter={() => setHovId(proc.id)} onMouseLeave={() => setHovId(null)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', background:'none', border:'none', cursor:'pointer',
                      color: flagged ? t.red : act ? t.accent : t.sub,
                      fontSize:13, fontWeight:act?700:400, whiteSpace:'nowrap', fontFamily:'inherit' }}>
                    {flagged && <span style={{ fontSize:11 }}>🚩</span>}
                    {od && !flagged && <span style={{ color:t.red, fontSize:11 }}>⚠</span>}
                    <span style={{ color: flagged ? t.red : proc.status==='completed' ? t.green : act ? t.accent : t.sub }}>
                      {proc.name}
                    </span>
                    {proc.docs.length > 0 && (
                      <span style={{ background:`${t.blue}22`, color:t.blue, borderRadius:99, fontSize:10, fontWeight:700, padding:'1px 6px' }}>{proc.docs.length}</span>
                    )}
                    {user.role==='admin' && hovId===proc.id && (
                      <span onClick={e => { e.stopPropagation(); setEditId(proc.id); setEditName(proc.name) }}
                        style={{ color:t.muted, cursor:'pointer', fontSize:11 }}>✏</span>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      {activeTab === 'overview' ? (
        <OverviewTab
          user={user} project={project} tasks={tasks} t={t}
          onSelectProc={id => setActiveTab(id)}
          onAddProcedure={onAddProcedure}
          onUpdateProcedure={onUpdateProcedure}
          onDeleteProcedure={onDeleteProcedure}
          onAddDocument={onAddDocument}
          onDeleteDocument={onDeleteDocument}
          targetPct={target}
          onSetTarget={handleSetTarget}
        />
      ) : selProc ? (
        <ProcPanel
          user={user} proc={selProc} project={project} tasks={tasks}
          onUpdate={onUpdateProcedure} onAddComment={onAddComment}
          onAddDocument={onAddDocument} onDeleteDocument={onDeleteDocument}
          onAddTask={onAddTask} onUpdateTaskStatus={onUpdateTaskStatus}
          onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} t={t}
        />
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:t.muted }}>
          <p>Selectează o procedură.</p>
        </div>
      )}
    </div>
  )
}
