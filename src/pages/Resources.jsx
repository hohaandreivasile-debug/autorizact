import { useState, useRef } from 'react'
import { useMobile } from '../hooks/useMobile'

// ── Date pre-completate Blue Line Energy ──────────────────────────
const PREFILL = {
  titular_nume:    'RACCOSTA GIORGIO',
  titular_cnp:     '7621204120014',
  firma_nume:      'BLUE LINE ENERGY SRL',
  firma_cui:       'RO22308410',
  firma_judet:     'Bistrița-Năsăud',
  firma_localitate:'Nușeni, sat Rusu de Sus',
  firma_telefon:   '0743468842',
  imobil_judet:    'Tulcea',
  imobil_localitate:'Valea Nucărilor',
  imobil_cadastral:'44415, 44432, 44525, 30812',
  imobil_suprafata:'40.963 mp',
  cu_nr:           '20/24.03.2026',
  cu_emitent:      'Primăria Comunei Valea Nucărilor',
  scop:            'Realizare Centrală Electrică Hibrid - Construire Baterie de Stocare - Punct de Conexiune Linie Electrică Subterană',
}

// ── Template formulare ────────────────────────────────────────────
const FORM_TEMPLATES = [
  {
    id: 'cerere_cu',
    name: 'Cerere Certificat de Urbanism (F.1)',
    icon: '🏛',
    color: '#6366F1',
    desc: 'Cerere tip F.1 pentru emiterea certificatului de urbanism',
    fields: [
      { id: 'f1', label: 'Subsemnatul (Titular)', type: 'text', value: PREFILL.titular_nume, required: true },
      { id: 'f2', label: 'CNP', type: 'text', value: PREFILL.titular_cnp },
      { id: 'f3', label: 'Reprezentant al (Firmă)', type: 'text', value: PREFILL.firma_nume },
      { id: 'f4', label: 'CUI Firmă', type: 'text', value: PREFILL.firma_cui },
      { id: 'f5', label: 'Județ domiciliu / sediu', type: 'text', value: PREFILL.firma_judet },
      { id: 'f6', label: 'Localitate domiciliu / sediu', type: 'text', value: PREFILL.firma_localitate },
      { id: 'f7', label: 'Telefon / Fax', type: 'text', value: PREFILL.firma_telefon },
      { id: 'f8', label: 'E-mail', type: 'email', value: '' },
      { id: 'f9', label: 'Imobil — Județ', type: 'text', value: PREFILL.imobil_judet },
      { id: 'f10', label: 'Imobil — Localitate / Comună', type: 'text', value: PREFILL.imobil_localitate },
      { id: 'f11', label: 'Nr. Cadastral', type: 'text', value: PREFILL.imobil_cadastral },
      { id: 'f12', label: 'Scopul cererii', type: 'textarea', value: PREFILL.scop },
      { id: 'f13', label: 'Data', type: 'date', value: new Date().toISOString().split('T')[0] },
    ],
  },
  {
    id: 'cerere_ac',
    name: 'Cerere Autorizație de Construire (F.8)',
    icon: '🏗',
    color: '#3B82F6',
    desc: 'Cerere tip F.8 pentru emiterea autorizației de construire/desființare',
    fields: [
      { id: 'f1', label: 'Subsemnatul (Titular)', type: 'text', value: PREFILL.titular_nume, required: true },
      { id: 'f2', label: 'CNP', type: 'text', value: PREFILL.titular_cnp },
      { id: 'f3', label: 'Reprezentant al (Firmă)', type: 'text', value: PREFILL.firma_nume },
      { id: 'f4', label: 'CUI Firmă', type: 'text', value: PREFILL.firma_cui },
      { id: 'f5', label: 'Județ domiciliu / sediu', type: 'text', value: PREFILL.firma_judet },
      { id: 'f6', label: 'Localitate domiciliu / sediu', type: 'text', value: PREFILL.firma_localitate },
      { id: 'f7', label: 'Telefon / Fax', type: 'text', value: PREFILL.firma_telefon },
      { id: 'f8', label: 'E-mail', type: 'email', value: '' },
      { id: 'f9', label: 'Imobil — Județ', type: 'text', value: PREFILL.imobil_judet },
      { id: 'f10', label: 'Imobil — Localitate / Comună', type: 'text', value: PREFILL.imobil_localitate },
      { id: 'f11', label: 'Nr. Cadastral', type: 'text', value: PREFILL.imobil_cadastral },
      { id: 'f12', label: 'Suprafață teren', type: 'text', value: PREFILL.imobil_suprafata },
      { id: 'f13', label: 'Certificat de Urbanism Nr.', type: 'text', value: PREFILL.cu_nr },
      { id: 'f14', label: 'CU emis de', type: 'text', value: PREFILL.cu_emitent },
      { id: 'f15', label: 'Lucrări propuse', type: 'textarea', value: PREFILL.scop },
      { id: 'f16', label: 'Valoare estimată lucrări (lei)', type: 'number', value: '' },
      { id: 'f17', label: 'Durată estimată execuție (luni)', type: 'number', value: '' },
      { id: 'f18', label: 'Proiectant (firmă / persoană)', type: 'text', value: '' },
      { id: 'f19', label: 'Data', type: 'date', value: new Date().toISOString().split('T')[0] },
    ],
  },
  {
    id: 'cerere_isu',
    name: 'Cerere Aviz Securitate la Incendiu — ISU',
    icon: '🔥',
    color: '#EF4444',
    desc: 'Cerere pentru emiterea avizului de securitate la incendiu (OMAI 180/2022)',
    fields: [
      { id: 'f1', label: 'Titular / Beneficiar', type: 'text', value: PREFILL.firma_nume, required: true },
      { id: 'f2', label: 'CUI / CIF', type: 'text', value: PREFILL.firma_cui },
      { id: 'f3', label: 'Reprezentant legal', type: 'text', value: PREFILL.titular_nume },
      { id: 'f4', label: 'Județ sediu', type: 'text', value: PREFILL.firma_judet },
      { id: 'f5', label: 'Localitate sediu', type: 'text', value: PREFILL.firma_localitate },
      { id: 'f6', label: 'Telefon', type: 'text', value: PREFILL.firma_telefon },
      { id: 'f7', label: 'E-mail', type: 'email', value: '' },
      { id: 'f8', label: 'Denumire obiectiv / construcție', type: 'text', value: 'Centrală Electrică Hibridă + Baterie Stocare + Punct Conexiune' },
      { id: 'f9', label: 'Amplasament — Județ', type: 'text', value: PREFILL.imobil_judet },
      { id: 'f10', label: 'Amplasament — Localitate / Comună', type: 'text', value: PREFILL.imobil_localitate },
      { id: 'f11', label: 'Adresă / Nr. Cadastral', type: 'text', value: PREFILL.imobil_cadastral },
      { id: 'f12', label: 'Certificat de Urbanism Nr.', type: 'text', value: PREFILL.cu_nr },
      { id: 'f13', label: 'Suprafață construită (mp)', type: 'number', value: '' },
      { id: 'f14', label: 'Funcțiunea construcției', type: 'text', value: 'Producere și stocare energie electrică' },
      { id: 'f15', label: 'Faza documentație (DTAC / PT)', type: 'text', value: 'DTAC' },
      { id: 'f16', label: 'Proiectant documentație ISU', type: 'text', value: '' },
      { id: 'f17', label: 'ISU destinatar', type: 'text', value: 'ISU Dobrogea — Tulcea' },
      { id: 'f18', label: 'Data', type: 'date', value: new Date().toISOString().split('T')[0] },
    ],
  },
  {
    id: 'cerere_apm',
    name: 'Notificare / Cerere Acord de Mediu — APM',
    icon: '🌿',
    color: '#10B981',
    desc: 'Cerere pentru emiterea acordului de mediu (Legea 292/2018, Anexa 5A)',
    fields: [
      { id: 'f1', label: 'Titular proiect (Firmă)', type: 'text', value: PREFILL.firma_nume, required: true },
      { id: 'f2', label: 'CUI / CIF', type: 'text', value: PREFILL.firma_cui },
      { id: 'f3', label: 'Reprezentant legal', type: 'text', value: PREFILL.titular_nume },
      { id: 'f4', label: 'CNP reprezentant', type: 'text', value: PREFILL.titular_cnp },
      { id: 'f5', label: 'Județ sediu', type: 'text', value: PREFILL.firma_judet },
      { id: 'f6', label: 'Localitate sediu', type: 'text', value: PREFILL.firma_localitate },
      { id: 'f7', label: 'Telefon', type: 'text', value: PREFILL.firma_telefon },
      { id: 'f8', label: 'E-mail', type: 'email', value: '' },
      { id: 'f9', label: 'Denumire proiect', type: 'text', value: PREFILL.scop },
      { id: 'f10', label: 'Amplasament — Județ', type: 'text', value: PREFILL.imobil_judet },
      { id: 'f11', label: 'Amplasament — Comună / Localitate', type: 'text', value: PREFILL.imobil_localitate },
      { id: 'f12', label: 'Nr. Cadastral / Coordonate', type: 'text', value: PREFILL.imobil_cadastral },
      { id: 'f13', label: 'Suprafață amplasament (mp)', type: 'text', value: PREFILL.imobil_suprafata },
      { id: 'f14', label: 'Certificat de Urbanism Nr.', type: 'text', value: PREFILL.cu_nr },
      { id: 'f15', label: 'CU emis de', type: 'text', value: PREFILL.cu_emitent },
      { id: 'f16', label: 'APM destinatar', type: 'text', value: 'APM Tulcea — Str. 14 Noiembrie nr. 5, Tulcea' },
      { id: 'f17', label: 'Tarif achitat (lei)', type: 'text', value: '100 lei — cont RO90TREZ6415032XXX000270' },
      { id: 'f18', label: 'Data', type: 'date', value: new Date().toISOString().split('T')[0] },
    ],
  },
  {
    id: 'cerere_djccpcn',
    name: 'Cerere Aviz DJCCPCN — Sit Arheologic',
    icon: '🏛',
    color: '#8B5CF6',
    desc: 'Cerere pentru avizul Direcției Județene Cultură — zona de protecție sit arheologic',
    fields: [
      { id: 'f1', label: 'Titular / Beneficiar', type: 'text', value: PREFILL.firma_nume, required: true },
      { id: 'f2', label: 'CUI', type: 'text', value: PREFILL.firma_cui },
      { id: 'f3', label: 'Reprezentant legal', type: 'text', value: PREFILL.titular_nume },
      { id: 'f4', label: 'Telefon', type: 'text', value: PREFILL.firma_telefon },
      { id: 'f5', label: 'E-mail', type: 'email', value: '' },
      { id: 'f6', label: 'Denumire investiție', type: 'text', value: PREFILL.scop },
      { id: 'f7', label: 'Amplasament', type: 'text', value: `Jud. ${PREFILL.imobil_judet}, Com. ${PREFILL.imobil_localitate}` },
      { id: 'f8', label: 'Nr. Cadastral', type: 'text', value: PREFILL.imobil_cadastral },
      { id: 'f9', label: 'Certificat de Urbanism', type: 'text', value: PREFILL.cu_nr },
      { id: 'f10', label: 'Motivare solicitare aviz', type: 'textarea', value: 'Amplasamentul se află în zona de protecție a unui sit arheologic, conform mențiunilor din Certificatul de Urbanism nr. ' + PREFILL.cu_nr + '. Solicit avizul DJCCPCN în vederea depunerii dosarului pentru Autorizația de Construire.' },
      { id: 'f11', label: 'DJCCPCN destinatar', type: 'text', value: 'DJCCPCN Tulcea' },
      { id: 'f12', label: 'Data', type: 'date', value: new Date().toISOString().split('T')[0] },
    ],
  },
  {
    id: 'cerere_generica',
    name: 'Cerere Generică (formular liber)',
    icon: '📋',
    color: '#F59E0B',
    desc: 'Cerere cu câmpuri libere, personalizabilă pentru orice aviz',
    fields: [
      { id: 'f1', label: 'Destinatar (Instituție)', type: 'text', value: '' },
      { id: 'f2', label: 'Titular / Solicitant', type: 'text', value: PREFILL.firma_nume },
      { id: 'f3', label: 'Reprezentant legal', type: 'text', value: PREFILL.titular_nume },
      { id: 'f4', label: 'CUI', type: 'text', value: PREFILL.firma_cui },
      { id: 'f5', label: 'Telefon', type: 'text', value: PREFILL.firma_telefon },
      { id: 'f6', label: 'Obiectul cererii', type: 'textarea', value: '' },
      { id: 'f7', label: 'Date amplasament', type: 'text', value: `Jud. ${PREFILL.imobil_judet}, Com. ${PREFILL.imobil_localitate}, Nr. cad. ${PREFILL.imobil_cadastral}` },
      { id: 'f8', label: 'Documente anexate', type: 'textarea', value: '1. Certificat de Urbanism nr. ' + PREFILL.cu_nr + '\n2. ' },
      { id: 'f9', label: 'Data', type: 'date', value: new Date().toISOString().split('T')[0] },
    ],
  },
]

// ── Main Component ────────────────────────────────────────────────
export default function Resources({ t, user }) {
  const isMobile = useMobile()
  const [view, setView]             = useState('library')   // 'library' | 'form'
  const [activeFormId, setActiveFormId] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [search, setSearch]         = useState('')

  const openForm = id => { setActiveFormId(id); setView('form') }

  const filteredDocs = uploadedDocs.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 1100, animation: 'fadeIn 0.35s ease', color: t.text }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.7px', color: t.text, margin: '0 0 6px' }}>
            📚 Documente & Formulare
          </h1>
          <p style={{ color: t.muted, fontSize: 14, margin: 0 }}>
            Formulare completabile + biblioteca de documente încărcate
          </p>
        </div>
        {view === 'form' && (
          <button onClick={() => setView('library')}
            style={{ background: 'none', border: `1.5px solid ${t.border}`, color: t.sub, borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 14 }}>
            ← Înapoi
          </button>
        )}
      </div>

      {view === 'library' && (
        <>
          {/* ── Formulare completabile ─────────────────────────── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${t.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>✍️</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>Cereri — completare automată</h2>
              <span style={{ fontSize: 12, color: t.muted, background: t.card, border: `1px solid ${t.border}`, padding: '2px 10px', borderRadius: 99 }}>
                Date Blue Line Energy pre-completate
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {FORM_TEMPLATES.map(tpl => (
                <div key={tpl.id}
                  onClick={() => openForm(tpl.id)}
                  style={{ background: t.card, border: `1px solid ${t.border}`, borderTop: `3px solid ${tpl.color}`, borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.15s', boxShadow: t.shadow }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = tpl.color; e.currentTarget.style.boxShadow = `0 8px 24px ${tpl.color}22` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${tpl.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{tpl.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>{tpl.name}</div>
                      <div style={{ fontSize: 11, color: tpl.color, fontWeight: 600, marginTop: 3 }}>{tpl.fields.length} câmpuri</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginBottom: 14 }}>{tpl.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tpl.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                      Completează → 
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Biblioteca documente ───────────────────────────── */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: t.shadow }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${t.blue}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📁</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Biblioteca de Documente</div>
                  <div style={{ fontSize: 12, color: t.muted }}>{uploadedDocs.length} fișier{uploadedDocs.length !== 1 ? 'e' : ''} încărcate</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {uploadedDocs.length > 0 && (
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Caută..."
                    style={{ background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 9, padding: '7px 12px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', width: 180 }} />
                )}
                <UploadButton t={t} onFiles={files => {
                  const newDocs = files.map(f => ({
                    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    name: f.name, size: f.size,
                    url: URL.createObjectURL(f),
                    date: new Date().toLocaleDateString('ro-RO'),
                    category: guessCat(f.name),
                  }))
                  setUploadedDocs(prev => [...prev, ...newDocs])
                }} />
              </div>
            </div>

            {uploadedDocs.length === 0 ? (
              <DropZone t={t} onFiles={files => {
                const newDocs = files.map(f => ({
                  id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  name: f.name, size: f.size,
                  url: URL.createObjectURL(f),
                  date: new Date().toLocaleDateString('ro-RO'),
                  category: guessCat(f.name),
                }))
                setUploadedDocs(prev => [...prev, ...newDocs])
              }} />
            ) : (
              <>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 120px 90px 100px 80px', padding: '10px 20px', background: t.bg, borderBottom: `1px solid ${t.border}` }}>
                  {['', 'Fișier', 'Categorie', 'Mărime', 'Data', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                  ))}
                </div>
                {filteredDocs.map((doc, idx) => (
                  <DocRow key={doc.id} doc={doc} idx={idx} total={filteredDocs.length} t={t}
                    onDelete={() => setUploadedDocs(d => d.filter(x => x.id !== doc.id))}
                    onRename={name => setUploadedDocs(d => d.map(x => x.id === doc.id ? { ...x, name } : x))} />
                ))}
                {filteredDocs.length === 0 && (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: t.muted, fontSize: 13 }}>
                    Niciun document potrivit pentru „{search}"
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {view === 'form' && activeFormId && (
        <FormEditor
          template={FORM_TEMPLATES.find(f => f.id === activeFormId)}
          t={t}
          onBack={() => setView('library')}
        />
      )}
    </div>
  )
}

// ── Form Editor ───────────────────────────────────────────────────
function FormEditor({ template, t, onBack }) {
  const [fields, setFields] = useState(template.fields.map(f => ({ ...f })))
  const [title,  setTitle]  = useState(template.name)
  const [printed, setPrinted] = useState(false)

  const updateField = (id, val) => setFields(fs => fs.map(f => f.id === id ? { ...f, value: val } : f))
  const deleteField = id => setFields(fs => fs.filter(f => f.id !== id))
  const addField = () => {
    const id = `f_custom_${Date.now()}`
    setFields(fs => [...fs, { id, label: 'Câmp nou', type: 'text', value: '', custom: true }])
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    const rows = fields.map(f => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#374151;width:35%;border-bottom:1px solid #e5e7eb">${f.label}</td>
        <td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb">${f.value || '________________________________'}</td>
      </tr>`).join('')
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>${title}</title>
      <style>body{font-family:Arial,sans-serif;margin:40px;color:#111827}
      h1{font-size:18px;margin-bottom:6px}
      .sub{color:#6b7280;font-size:13px;margin-bottom:24px}
      table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px}
      .footer{margin-top:40px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}
      @media print{.no-print{display:none}}</style></head>
      <body>
      <button class="no-print" onclick="window.print()" style="margin-bottom:20px;padding:8px 16px;cursor:pointer">Tipărește</button>
      <h1>${title}</h1>
      <div class="sub">Blue Line Energy SRL · CUI ${PREFILL.firma_cui} · Generat: ${new Date().toLocaleDateString('ro-RO')}</div>
      <table>${rows}</table>
      <div class="footer">
        <p>Subsemnatul declar pe propria răspundere că datele menționate în prezenta cerere sunt exacte.</p>
        <br/><br/>
        <p>Data: ____________________ &nbsp;&nbsp;&nbsp;&nbsp; Semnătura: ____________________</p>
      </div>
      </body></html>`)
    win.document.close()
    setPrinted(true)
    setTimeout(() => setPrinted(false), 2000)
  }

  return (
    <div>
      {/* Form header */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderTop: `4px solid ${template.color}`, borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: t.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${template.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{template.icon}</div>
          <input value={title} onChange={e => setTitle(e.target.value)}
            style={{ fontSize: 18, fontWeight: 800, background: 'transparent', border: 'none', color: t.text, outline: 'none', fontFamily: 'inherit', flex: 1 }} />
        </div>
        <div style={{ fontSize: 12, color: t.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>📋 {fields.length} câmpuri active</span>
          <span>🏢 {PREFILL.firma_nume}</span>
          <span>📍 {PREFILL.imobil_judet}, {PREFILL.imobil_localitate}</span>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {fields.map((field, idx) => (
          <FieldRow key={field.id} field={field} idx={idx} t={t}
            onChange={val => updateField(field.id, val)}
            onDelete={() => deleteField(field.id)} />
        ))}
      </div>

      {/* Add field */}
      <button onClick={addField}
        style={{ width: '100%', padding: '12px', background: 'transparent', border: `2px dashed ${t.border}`, borderRadius: 12, color: t.muted, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted }}>
        <span style={{ fontSize: 18 }}>＋</span> Adaugă câmp nou
      </button>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack}
          style={{ flex: 1, background: 'transparent', border: `1.5px solid ${t.border}`, color: t.sub, borderRadius: 12, padding: '12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 14 }}>
          ← Înapoi
        </button>
        <button onClick={handlePrint}
          style={{ flex: 2, background: template.color, border: 'none', color: '#fff', borderRadius: 12, padding: '12px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 14, boxShadow: `0 4px 14px ${template.color}44`, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {printed ? '✓ Deschis pentru tipărire!' : '🖨 Generează / Tipărește Cererea'}
        </button>
      </div>
    </div>
  )
}

// ── Field Row ─────────────────────────────────────────────────────
function FieldRow({ field, idx, t, onChange, onDelete }) {
  const [editLabel, setEditLabel] = useState(false)
  const [labelVal,  setLabelVal]  = useState(field.label)

  const inputStyle = {
    width: '100%', background: t.bg, border: `1.5px solid ${t.border}`,
    borderRadius: 9, padding: '9px 12px', color: t.text,
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    resize: field.type === 'textarea' ? 'vertical' : 'none',
    minHeight: field.type === 'textarea' ? 72 : 'auto',
  }

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: t.shadow }}>
      {/* Index */}
      <div style={{ width: 26, height: 26, borderRadius: 7, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: t.muted, flexShrink: 0, marginTop: 2 }}>
        {idx + 1}
      </div>

      {/* Label + input */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editLabel ? (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input autoFocus value={labelVal} onChange={e => setLabelVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setEditLabel(false) }}
              style={{ flex: 1, background: t.bg, border: `1.5px solid ${t.accent}`, borderRadius: 7, padding: '4px 9px', color: t.text, fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={() => { field.label = labelVal; setEditLabel(false) }}
              style={{ background: t.accent, border: 'none', borderRadius: 6, padding: '4px 10px', color: t.accentText, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>✓</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{labelVal}</label>
            <button onClick={() => setEditLabel(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: 11, padding: '0 2px' }} title="Redenumește câmpul">✏</button>
          </div>
        )}

        {field.type === 'textarea' ? (
          <textarea value={field.value} onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, minHeight: 72 }} rows={3} />
        ) : (
          <input type={field.type || 'text'} value={field.value} onChange={e => onChange(e.target.value)}
            style={inputStyle} />
        )}
      </div>

      {/* Delete */}
      <button onClick={onDelete} title="Șterge câmpul"
        style={{ width: 30, height: 30, borderRadius: 8, background: `${t.red}12`, border: `1px solid ${t.red}33`, color: t.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 20 }}>
        🗑
      </button>
    </div>
  )
}

// ── Doc Row ───────────────────────────────────────────────────────
function DocRow({ doc, idx, total, t, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(doc.name)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 120px 90px 100px 80px', padding: '12px 20px', borderBottom: idx < total - 1 ? `1px solid ${t.border}` : 'none', alignItems: 'center', transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = `${t.accent}08`}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      <div style={{ fontSize: 20 }}>{fileIcon(doc.name)}</div>

      <div style={{ minWidth: 0, paddingRight: 12 }}>
        {editing ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onRename(nameVal); setEditing(false) } if (e.key === 'Escape') setEditing(false) }}
              style={{ flex: 1, background: t.bg, border: `1.5px solid ${t.accent}`, borderRadius: 6, padding: '4px 8px', color: t.text, fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={() => { onRename(nameVal); setEditing(false) }}
              style={{ background: t.accent, border: 'none', borderRadius: 5, padding: '4px 8px', color: t.accentText, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>✓</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
            <button onClick={() => setEditing(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: 11, padding: '0 2px', flexShrink: 0 }} title="Redenumește">✏</button>
          </div>
        )}
      </div>

      <div>
        <span style={{ fontSize: 11, fontWeight: 600, color: catColor(doc.category), background: catColor(doc.category) + '22', padding: '2px 9px', borderRadius: 6 }}>
          {doc.category}
        </span>
      </div>

      <div style={{ fontSize: 12, color: t.muted }}>{fmtSize(doc.size)}</div>

      <div style={{ fontSize: 12, color: t.muted }}>{doc.date}</div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        {doc.url && (
          <a href={doc.url} download={doc.name} target="_blank" rel="noreferrer" title="Descarcă"
            style={{ width: 28, height: 28, borderRadius: 7, background: `${t.blue}18`, border: `1px solid ${t.blue}44`, color: t.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 14 }}>↓</a>
        )}
        <button onClick={onDelete} title="Șterge"
          style={{ width: 28, height: 28, borderRadius: 7, background: `${t.red}12`, border: `1px solid ${t.red}33`, color: t.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🗑</button>
      </div>
    </div>
  )
}

// ── Drop Zone ─────────────────────────────────────────────────────
function DropZone({ t, onFiles }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef(null)
  return (
    <div
      style={{ padding: '48px 32px', textAlign: 'center', background: drag ? `${t.accent}10` : 'transparent', transition: 'background 0.15s', cursor: 'pointer', borderRadius: '0 0 20px 20px' }}
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); onFiles(Array.from(e.dataTransfer.files)) }}>
      <div style={{ fontSize: 48, marginBottom: 14, opacity: drag ? 1 : 0.35 }}>📂</div>
      <p style={{ color: t.sub, fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>
        {drag ? 'Eliberează fișierele' : 'Trage fișierele sau click pentru a încărca'}
      </p>
      <p style={{ color: t.muted, fontSize: 12, margin: 0 }}>PDF, Word, Excel, imagini, DWG — orice format</p>
      <input ref={ref} type="file" multiple onChange={e => onFiles(Array.from(e.target.files))} style={{ display: 'none' }} />
    </div>
  )
}

// ── Upload Button ─────────────────────────────────────────────────
function UploadButton({ t, onFiles }) {
  const ref = useRef(null)
  return (
    <>
      <button onClick={() => ref.current.click()}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: t.accentGrad || t.accent, color: t.accentText, border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 12px ${t.accent}44` }}>
        ↑ Încarcă documente
      </button>
      <input ref={ref} type="file" multiple onChange={e => onFiles(Array.from(e.target.files))} style={{ display: 'none' }} />
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────
function fileIcon(name) {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📕'
  if (['doc','docx'].includes(ext)) return '📘'
  if (['xls','xlsx','csv'].includes(ext)) return '📗'
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼'
  if (['zip','rar','7z'].includes(ext)) return '🗜'
  if (['dwg','dxf'].includes(ext)) return '📐'
  return '📄'
}

function fmtSize(b) {
  if (!b) return '—'
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`
  return `${(b/1048576).toFixed(1)} MB`
}

function guessCat(name) {
  const n = name.toLowerCase()
  if (n.includes('isu') || n.includes('incendiu')) return 'ISU'
  if (n.includes('apm') || n.includes('mediu')) return 'APM'
  if (n.includes('cu') || n.includes('urbanism')) return 'CU'
  if (n.includes('ac') || n.includes('autoriza')) return 'AC'
  if (n.includes('cadastr') || n.includes('cf') || n.includes('carte')) return 'CF'
  if (n.includes('geoteh')) return 'Geotehnică'
  if (n.includes('dtac') || n.includes('proiect')) return 'DTAC'
  return 'General'
}

function catColor(cat) {
  const map = { ISU:'#EF4444', APM:'#10B981', CU:'#6366F1', AC:'#3B82F6', CF:'#14B8A6', Geotehnică:'#F59E0B', DTAC:'#8B5CF6', General:'#94A3B8' }
  return map[cat] || '#94A3B8'
}
