import { useState, useRef } from 'react'
import { Badge, FormInput, BtnRow, PrimaryBtn, Card } from '../components/UI'
import { useMobile } from '../hooks/useMobile'
import { fmt, isOD, dLeft } from '../lib/data'

// ── Claude API — extrage date din PDF-ul CU ───────────────────────
async function extractFromCU(pdfFile) {
  const base64 = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = rej
    r.readAsDataURL(pdfFile)
  })

  const response = await fetch('/api/extract-cu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64: base64 }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Server error')
  }

  return await response.json()
}

// ── Modal Proiect Nou ─────────────────────────────────────────────
function AddProjectModal({ onClose, onSave, t }) {
  const [form, setForm] = useState({
    name: '', certificat: '', address: '', emitent: '',
    dataEmitere: '', dataExpirare: '', procedures: [],
  })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [fileName, setFileName] = useState('')
  const [extracted, setExtracted] = useState(false)
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setLoading(true)
    setError('')
    setExtracted(false)
    try {
      const data = await extractFromCU(file)
      setForm(f => ({
        name:        data.name        || f.name,
        certificat:  data.certificat  || f.certificat,
        address:     data.address     || f.address,
        emitent:     data.emitent     || f.emitent,
        dataEmitere: data.dataEmitere || f.dataEmitere,
        dataExpirare:data.dataExpirare|| f.dataExpirare,
        procedures:  data.procedures  || [],
      }))
      setExtracted(true)
    } catch (err) {
      setError('Nu s-a putut extrage automat. Completează manual câmpurile.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
  }

  const fields = [
    ['name',         'Denumire Proiect / Scop *', 'text'],
    ['certificat',   'Nr. Certificat de Urbanism', 'text'],
    ['address',      'Adresă imobil',              'text'],
    ['emitent',      'Emitent (Primărie)',          'text'],
    ['dataEmitere',  'Data Emiterii',               'date'],
    ['dataExpirare', 'Data Expirării',              'date'],
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, width: '100%', maxWidth: 560, boxShadow: t.shadow, animation: 'fadeIn 0.2s ease', maxHeight: '90vh', overflow: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: t.text }}>Proiect Nou</h2>
            <button onClick={onClose} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: t.muted, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: t.muted }}>Încarcă CU-ul pentru completare automată sau completează manual</p>
        </div>

        <div style={{ padding: 28 }}>

          {/* PDF Upload zone */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: t.sub, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Certificat de Urbanism (PDF) — completare automată cu AI
            </label>

            <div
              onClick={() => !loading && fileRef.current.click()}
              style={{
                border: `2px dashed ${extracted ? t.green : loading ? t.accent : t.border}`,
                borderRadius: 14, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: loading ? 'wait' : 'pointer',
                background: extracted ? `${t.green}0D` : loading ? `${t.accent}0D` : t.bg,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = t.accent }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.borderColor = extracted ? t.green : t.border }}>

              <div style={{ width: 48, height: 48, borderRadius: 12, background: extracted ? `${t.green}22` : loading ? `${t.accent}22` : `${t.border}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {loading ? '⏳' : extracted ? '✅' : '📄'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {loading ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, marginBottom: 4 }}>Extrag datele din CU...</div>
                    <div style={{ fontSize: 12, color: t.muted }}>Claude AI analizează documentul</div>
                    <div style={{ marginTop: 8, height: 4, background: t.border, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '60%', background: t.accentGrad || t.accent, borderRadius: 99, animation: 'shimmer 1.5s infinite' }} />
                    </div>
                  </>
                ) : extracted ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.green, marginBottom: 3 }}>Date extrase cu succes!</div>
                    <div style={{ fontSize: 12, color: t.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</div>
                    {form.procedures?.length > 0 && (
                      <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, marginTop: 4 }}>
                        📋 {form.procedures.length} avize/proceduri extrase din CU
                      </div>
                    )}
                    <button onClick={e => { e.stopPropagation(); fileRef.current.click() }}
                      style={{ marginTop: 6, background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
                      Înlocuiește fișierul
                    </button>
                  </>
                ) : fileName ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 3 }}>{fileName}</div>
                    <div style={{ fontSize: 12, color: t.muted }}>Fișier selectat</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 3 }}>Apasă sau trage PDF-ul CU</div>
                    <div style={{ fontSize: 12, color: t.muted }}>Câmpurile de mai jos se vor completa automat</div>
                  </>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />

            {error && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: `${t.red}12`, border: `1px solid ${t.red}33`, borderRadius: 10, fontSize: 13, color: t.red }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: t.border }} />
            <span style={{ fontSize: 11, color: t.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {extracted ? '✓ Pre-completat — verifică și ajustează' : 'Sau completează manual'}
            </span>
            <div style={{ flex: 1, height: 1, background: t.border }} />
          </div>

          {/* Form fields */}
          {fields.map(([k, lbl, type]) => (
            <FormInput key={k} label={lbl} type={type} t={t}
              value={form[k]}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              style={extracted && form[k] ? { borderColor: `${t.green}88` } : {}}
            />
          ))}

          <BtnRow t={t}
            onCancel={onClose}
            onSave={handleSave}
            saveLabel={form.name.trim() ? 'Creează Proiect' : 'Completează Denumirea *'}
          />
        </div>
      </div>
    </div>
  )
}

// ── Edit Project Modal ────────────────────────────────────────────
function EditProjectModal({ project, onClose, onSave, t }) {
  const [form, setForm] = useState({
    name: project.name || '', certificat: project.certificat || '',
    address: project.address || '', emitent: project.emitent || '',
    dataEmitere: project.dataEmitere || '', dataExpirare: project.dataExpirare || '',
  })
  const fields = [
    ['name','Denumire Proiect *','text'],['certificat','Nr. CU','text'],
    ['address','Adresă imobil','text'],['emitent','Emitent','text'],
    ['dataEmitere','Data Emiterii','date'],['dataExpirare','Data Expirării','date'],
  ]
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:24, backdropFilter:'blur(4px)' }}>
      <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:22, width:'100%', maxWidth:500, boxShadow:t.shadow, animation:'fadeIn 0.2s ease' }}>
        <div style={{ padding:'24px 28px 18px', borderBottom:`1px solid ${t.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:t.text }}>Editează Proiect</h2>
          <button onClick={onClose} style={{ background:t.bg, border:`1px solid ${t.border}`, borderRadius:8, width:30, height:30, cursor:'pointer', color:t.muted, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:28 }}>
          {fields.map(([k,lbl,type]) => (
            <FormInput key={k} label={lbl} type={type} t={t} value={form[k]} onChange={e => setForm(f => ({...f, [k]:e.target.value}))} />
          ))}
          <BtnRow t={t} onCancel={onClose} onSave={() => { if(form.name.trim()) onSave(form) }} saveLabel="Salvează" />
        </div>
      </div>
    </div>
  )
}

// ── Confirm Delete Modal (reusable) ───────────────────────────────
function ConfirmDelete({ title, message, onConfirm, onClose, t }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:24, backdropFilter:'blur(4px)' }}>
      <div style={{ background:t.card, border:`1px solid ${t.red}55`, borderRadius:20, padding:32, width:'100%', maxWidth:400, boxShadow:t.shadow }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${t.red}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🗑</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:4 }}>{title}</div>
            <div style={{ fontSize:13, color:t.muted, lineHeight:1.4 }}>{message}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:'transparent', border:`1.5px solid ${t.border}`, color:t.sub, borderRadius:10, padding:11, cursor:'pointer', fontWeight:600, fontFamily:'inherit', fontSize:14 }}>Anul</button>
          <button onClick={onConfirm} style={{ flex:1, background:`linear-gradient(135deg,${t.red},#B91C1C)`, border:'none', color:'#fff', borderRadius:10, padding:11, cursor:'pointer', fontWeight:700, fontFamily:'inherit', fontSize:14 }}>Șterge</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function ProjectList({ user, projects, onOpen, onAdd, onDelete, onEdit, t }) {
  const isMobile = useMobile()
  const [showAdd,    setShowAdd]    = useState(false)
  const [editProj,   setEditProj]   = useState(null)
  const [deleteProj, setDeleteProj] = useState(null)

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 1200, animation: 'fadeIn 0.35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.7px', color: t.text, margin: 0 }}>Proiecte</h1>
          <p style={{ color: t.muted, fontSize: 14, margin: '6px 0 0' }}>{projects.length} certificate de urbanism înregistrate</p>
        </div>
        {user.role === 'admin' && <PrimaryBtn t={t} icon="+" onClick={() => setShowAdd(true)}>Proiect Nou</PrimaryBtn>}
      </div>

      {projects.length === 0 && (
        <Card t={t} style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.5 }}>📁</div>
          <p style={{ fontSize: 16, color: t.sub, fontWeight: 700, marginBottom: 6 }}>Niciun proiect adăugat</p>
          {user.role === 'admin' && <p style={{ fontSize: 13, color: t.muted }}>Apasă <strong>"+ Proiect Nou"</strong> și încarcă CU-ul pentru completare automată</p>}
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(330px,1fr))', gap: 20 }}>
        {projects.map((p, idx) => {
          const total   = p.procedures.length
          const done    = p.procedures.filter(pr => pr.status === 'completed').length
          const od      = p.procedures.filter(pr => isOD(pr.deadline) && pr.status !== 'completed').length
          const pct     = total > 0 ? Math.round(done / total * 100) : 0
          const expDays = dLeft(p.dataExpirare)
          const expWarn = expDays !== null && expDays <= 30 && expDays >= 0
          const sc      = t.statCards?.[idx % 4]

          return (
            <div key={p.id}
              style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:20, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:t.shadow, position:'relative' }}
              onClick={() => onOpen(p.id)}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,0.3)`; e.currentTarget.style.borderColor=t.accent }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=t.shadow; e.currentTarget.style.borderColor=t.border }}>

              <div style={{ height:6, background:sc?.bg||t.accentGrad }} />

              {/* Edit/Delete buttons — admin only */}
              {user.role === 'admin' && (
                <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6, zIndex:10 }}
                  onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEditProj(p)} title="Editează proiect"
                    style={{ width:28, height:28, borderRadius:7, background:`${t.accent}18`, border:`1px solid ${t.accent}44`, color:t.accent, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>✏</button>
                  <button onClick={() => setDeleteProj(p)} title="Șterge proiect"
                    style={{ width:28, height:28, borderRadius:7, background:`${t.red}12`, border:`1px solid ${t.red}33`, color:t.red, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🗑</button>
                </div>
              )}

              <div style={{ padding:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ flex:1, minWidth:0, marginRight:user.role==='admin'?72:12 }}>
                    <h3 style={{ fontSize:15, fontWeight:700, color:t.text, margin:'0 0 6px', lineHeight:1.3 }}>{p.name}</h3>
                    <span style={{ fontSize:11, color:t.accent, fontWeight:700, fontFamily:"'DM Mono',monospace", background:`${t.accent}18`, padding:'2px 8px', borderRadius:6 }}>{p.certificat}</span>
                  </div>
                  <Badge status={p.status} />
                </div>

                <p style={{ color:t.muted, fontSize:12, margin:'0 0 18px', lineHeight:1.5 }}>📍 {p.address}</p>

                <div style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:t.muted, fontWeight:500 }}>{done} din {total} proceduri</span>
                    <span style={{ fontSize:13, color:t.text, fontWeight:700 }}>{pct}%</span>
                  </div>
                  <div style={{ height:6, background:t.bg, borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:pct===100?t.green:sc?.bg||t.accentGrad, borderRadius:99, transition:'width 0.6s ease' }} />
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:expWarn?t.orange:t.muted, fontWeight:expWarn?700:400 }}>
                    ⏰ {fmt(p.dataExpirare)} {expWarn?`(${expDays}z)`:''}
                  </span>
                  {od > 0 && (
                    <span style={{ background:`${t.red}18`, color:t.red, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, border:`1px solid ${t.red}33` }}>
                      ⚠ {od} depășit{od>1?'e':''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showAdd && <AddProjectModal t={t} onClose={() => setShowAdd(false)} onSave={form => { onAdd(form); setShowAdd(false) }} />}

      {editProj && (
        <EditProjectModal t={t} project={editProj} onClose={() => setEditProj(null)}
          onSave={form => { onEdit(editProj.id, form); setEditProj(null) }} />
      )}

      {deleteProj && (
        <ConfirmDelete t={t}
          title="Șterge proiect?"
          message={`„${deleteProj.name}" va fi șters permanent împreună cu toate procedurile, documentele și sarcinile.`}
          onClose={() => setDeleteProj(null)}
          onConfirm={() => { onDelete(deleteProj.id); setDeleteProj(null) }} />
      )}
    </div>
  )
}
