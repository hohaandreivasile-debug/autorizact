// ── Users (locali, nu în Supabase Auth) ─────────────────────────
export const USERS = {
  dacian:   { id:'dacian',   name:'Dacian Nath',      role:'admin',  initials:'DN', bg:'#F59E0B', tc:'#000' },
  raccosta: { id:'raccosta', name:'Raccosta Giorgio',  role:'member', initials:'RG', bg:'#3B82F6', tc:'#fff' },
  sorin:    { id:'sorin',    name:'Sorin Terpe',       role:'member', initials:'ST', bg:'#10B981', tc:'#fff' },
}

export const STATUS = {
  pending:     { label:'În așteptare', color:'#94A3B8', bg:'rgba(148,163,184,0.12)' },
  in_progress: { label:'În lucru',     color:'#F59E0B', bg:'rgba(245,158,11,0.12)'  },
  review:      { label:'Revizuire',    color:'#60A5FA', bg:'rgba(96,165,250,0.12)'  },
  completed:   { label:'Finalizat',    color:'#34D399', bg:'rgba(52,211,153,0.12)'  },
  overdue:     { label:'Depășit',      color:'#F87171', bg:'rgba(248,113,113,0.12)' },
}

export const PRIORITY = {
  critical: { label:'Critic',  color:'#F87171' },
  high:     { label:'Ridicat', color:'#FB923C' },
  medium:   { label:'Mediu',   color:'#FBBF24' },
  low:      { label:'Scăzut',  color:'#60A5FA' },
}

// ── Helpers ──────────────────────────────────────────────────────
let _uid = Date.now()
export const uid = () => `id_${++_uid}`

export const fmt = d => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ro-RO', { day:'2-digit', month:'2-digit', year:'numeric' })
}
export const fmtTs = d => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ro-RO', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
}
export const addD = n => {
  const r = new Date(); r.setDate(r.getDate() + n)
  return r.toISOString().split('T')[0]
}
export const isOD  = d => d && new Date(d) < new Date()
export const dLeft = d => {
  if (!d) return null
  return Math.ceil((new Date(d) - new Date()) / 86400000)
}

// ════════════════════════════════════════════════════════════════
// SEED: Centrală Electrică Hibridă — Valea Nucărilor, Tulcea
// Sursă: Certificat de Urbanism Nr. 20/24.03.2026
// Emitent: Primăria Comunei Valea Nucărilor, jud. Tulcea
// Titular: Blue Line Energy SRL — reprezentant Raccosta Giorgio
// Scop: Realizare Centrală Electrică Hibrid + Baterie Stocare
//        + Punct Conexiune Linie Electrică Subterană
// Teren: 40.963 mp extravilan
//        Nr. cad. 44415, 44432, 44525, 30812
// Contract de Superficie nr. 1327/23.06.2023
// Valabilitate CU: 24 luni → expiră 24.03.2028
// ════════════════════════════════════════════════════════════════
export const SEED_PROJECTS = [
  {
    id: 'ble-v-nucarilor',
    name: 'Centrală Electrică Hibridă + Baterie Stocare — Valea Nucărilor',
    certificat: 'CU nr. 20/24.03.2026',
    address: 'Jud. Tulcea, Com. Valea Nucărilor, extravilan — Nr. cad. 44415, 44432, 44525, 30812',
    emitent: 'Primăria Comunei Valea Nucărilor, jud. Tulcea',
    dataEmitere: '2026-03-24',
    dataExpirare: '2028-03-24',
    status: 'in_progress',
    procedures: [

      // ── 1. Documentație pregătitoare ─────────────────────────
      {
        id: 'ble-pr-01',
        name: 'Studiu Geotehnic',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-01',
          text: 'Cerut explicit prin CU (pct. d.4). Necesar înainte de elaborarea DTAC. De contactat firmă de geotehnică autorizată.',
          author: 'dacian',
          ts: '2026-03-25T09:00:00',
          voice: false,
        }],
      },
      {
        id: 'ble-pr-02',
        name: 'Viză Verificator de Proiecte Atestat',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-02',
          text: 'Obligatoriu conform pct. d.4 din CU. Verificatorul trebuie să fie atestat MLPAT.',
          author: 'dacian',
          ts: '2026-03-25T09:05:00',
          voice: false,
        }],
      },

      // ── 2. Titlu imobil ──────────────────────────────────────
      {
        id: 'ble-pr-03',
        name: 'Dovada Titlului Imobil — Extras CF + Plan Cadastral actualizat',
        status: 'in_progress',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-03',
          text: 'Contract de Superficie nr. 1327/23.06.2023 — Blue Line Energy SRL, CIF R022308410. Suprafață teren: 40.963 mp. Necesare extras CF și plan cadastral actualizate la zi — pct. b din CU.',
          author: 'raccosta',
          ts: '2026-03-25T10:00:00',
          voice: false,
        }],
      },

      // ── 3. Avize utilități (pct. d.1 din CU) ─────────────────
      {
        id: 'ble-pr-04',
        name: 'Aviz Alimentare cu Energie Electrică',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-04',
          text: 'Bifat "x alimentare cu energie electrică" în CU (pct. d.1). De solicitat la distribuitorul de energie din zonă (Distribuție Energie Electrică România / E-Distribuție Dobrogea).',
          author: 'raccosta',
          ts: '2026-03-25T10:05:00',
          voice: false,
        }],
      },
      {
        id: 'ble-pr-05',
        name: 'Aviz Salubritate',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-05',
          text: 'Bifat "X salubritate" în CU (pct. d.1). De solicitat la operatorul de salubritate din județul Tulcea.',
          author: 'raccosta',
          ts: '2026-03-25T10:08:00',
          voice: false,
        }],
      },

      // ── 4. Avize securitate / sănătate (pct. d.2 din CU) ────
      {
        id: 'ble-pr-06',
        name: 'Aviz Securitate la Incendiu — ISU Tulcea',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-06',
          text: 'Aviz ISU obligatoriu conform pct. d.2 din CU (securitatea la incendiu). Dosar la ISU Dobrogea — Tulcea.',
          author: 'sorin',
          ts: '2026-03-25T11:00:00',
          voice: false,
        }],
      },
      {
        id: 'ble-pr-07',
        name: 'Aviz Protecție Civilă',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [],
      },
      {
        id: 'ble-pr-08',
        name: 'Aviz Sănătatea Populației — DSP Tulcea',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [],
      },

      // ── 5. Avize administrație publică (pct. d.3 din CU) ────
      {
        id: 'ble-pr-09',
        name: 'Aviz DJCCPCN Tulcea — Sit Arheologic',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-07',
          text: 'CU specifică zona de protecție sit arheologic (pct. 1 — Regimul Juridic). Avizul Direcției Județene pentru Cultură, Culte și Patrimoniul Cultural Național este obligatoriu conform pct. d.3.',
          author: 'dacian',
          ts: '2026-03-25T09:15:00',
          voice: false,
        }],
      },
      {
        id: 'ble-pr-10',
        name: 'Acord Acces Drumuri Exploatare — Primăria Valea Nucărilor',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-08',
          text: 'Necesar conform pct. d.3 din CU. Terenul are acces via drum de exploatare. De programat întâlnire la Primăria Com. Valea Nucărilor, str. I.G.Duca nr. 28.',
          author: 'raccosta',
          ts: '2026-03-25T10:10:00',
          voice: false,
        }],
      },
      {
        id: 'ble-pr-11',
        name: 'Aviz Direcția Lucrări Publice Drumuri Județene Tulcea',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-09',
          text: 'Necesar deoarece amplasamentul este adiacent drumului județean. Regula CU: distanța dintre axul drumului județean și garduri/construcții = minim 24 m. Pct. d.3 din CU.',
          author: 'dacian',
          ts: '2026-03-25T09:20:00',
          voice: false,
        }],
      },
      {
        id: 'ble-pr-12',
        name: 'Acord Alți Titulari Afectați (Cod Civil)',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-10',
          text: 'De verificat dacă există proprietari adiacenți care necesită acord conform Codului Civil — pct. d.3 din CU.',
          author: 'sorin',
          ts: '2026-03-25T11:05:00',
          voice: false,
        }],
      },

      // ── 6. Protecția mediului (Directiva EIA) ────────────────
      {
        id: 'ble-pr-13',
        name: 'Act Administrativ APM Tulcea — Evaluare Impact Mediu',
        status: 'in_progress',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-11',
          text: 'PRIORITATE MAXIMĂ conform CU (pct. 4): de prezentat la APM Tulcea, Str. 14 Noiembrie, nr. 5, Tulcea imediat după primirea CU. APM decide încadrarea/neîncadrarea în lista EIA (Directiva 85/337/CEE). Procedura se desfășoară ANTERIOR depunerii dosarului de autorizare.',
          author: 'dacian',
          ts: '2026-03-25T09:30:00',
          voice: false,
        }],
      },

      // ── 7. Documentație tehnică ──────────────────────────────
      {
        id: 'ble-pr-14',
        name: 'Documentație Tehnică DTAC + DTOE',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-12',
          text: 'CU solicită DTAC (Documentație Tehnică pentru Autorizarea Construirii) și DTOE (Organizarea Executării Lucrărilor) — pct. c. Se elaborează după obținerea avizelor și acordului de mediu.',
          author: 'dacian',
          ts: '2026-03-25T09:45:00',
          voice: false,
        }],
      },

      // ── 8. Taxe legale ───────────────────────────────────────
      {
        id: 'ble-pr-15',
        name: 'Dovadă Achitare Taxe Legale Autorizație de Construire',
        status: 'pending',
        deadline: '',
        docs: [],
        comments: [{
          id: 'ble-c-13',
          text: 'Taxe de plătit la depunere dosar AC: 1% taxa AC (subcap. 4.1 + 5.1.1 din devizul general) + 0,5‰ timbru arhitectură din valoarea investiției. Dovadă chitanță din 20.03.2026 nr. 1807 = 264 lei pentru CU deja achitat.',
          author: 'raccosta',
          ts: '2026-03-25T10:15:00',
          voice: false,
        }],
      },

      // ── 9. Final ─────────────────────────────────────────────
      {
        id: 'ble-pr-16',
        name: 'Depunere Dosar Complet + Emitere Autorizație de Construire',
        status: 'pending',
        deadline: '2027-12-31',
        docs: [],
        comments: [{
          id: 'ble-c-14',
          text: 'Pasul final — depunere dosar complet la Primăria Comunei Valea Nucărilor după obținerea tuturor avizelor, acordului APM și finalizarea DTAC. CU valabil până pe 24.03.2028.',
          author: 'dacian',
          ts: '2026-03-25T09:50:00',
          voice: false,
        }],
      },
    ],
  },
]

export const SEED_TASKS = [
  {
    id: 'ble-t-01',
    title: 'Prezentare la APM Tulcea pentru evaluare inițială impact mediu — str. 14 Noiembrie nr. 5',
    projectId: 'ble-v-nucarilor',
    procId: 'ble-pr-13',
    assignedTo: 'raccosta',
    assignedBy: 'dacian',
    dueDate: '2026-04-05',
    status: 'in_progress',
    priority: 'critical',
  },
  {
    id: 'ble-t-02',
    title: 'Solicitare Extras CF actualizat + Plan Cadastral — nr. 44415, 44432, 44525, 30812',
    projectId: 'ble-v-nucarilor',
    procId: 'ble-pr-03',
    assignedTo: 'raccosta',
    assignedBy: 'dacian',
    dueDate: '2026-04-07',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 'ble-t-03',
    title: 'Contactează firmă geotehnică — ofertă studiu geotehnic amplasament extravilan 40.963 mp',
    projectId: 'ble-v-nucarilor',
    procId: 'ble-pr-01',
    assignedTo: 'sorin',
    assignedBy: 'dacian',
    dueDate: '2026-04-10',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'ble-t-04',
    title: 'Depune solicitare Aviz DJCCPCN Tulcea (sit arheologic)',
    projectId: 'ble-v-nucarilor',
    procId: 'ble-pr-09',
    assignedTo: 'sorin',
    assignedBy: 'dacian',
    dueDate: '2026-04-20',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'ble-t-05',
    title: 'Acord acces drumuri exploatare — programare întâlnire Primărie Valea Nucărilor',
    projectId: 'ble-v-nucarilor',
    procId: 'ble-pr-10',
    assignedTo: 'raccosta',
    assignedBy: 'dacian',
    dueDate: '2026-04-15',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'ble-t-06',
    title: 'Solicită aviz ISU Dobrogea Tulcea — dosar securitate la incendiu',
    projectId: 'ble-v-nucarilor',
    procId: 'ble-pr-06',
    assignedTo: 'sorin',
    assignedBy: 'dacian',
    dueDate: '2026-04-25',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'ble-t-07',
    title: 'Contactează distribuitor energie electrică Dobrogea pentru aviz racord',
    projectId: 'ble-v-nucarilor',
    procId: 'ble-pr-04',
    assignedTo: 'raccosta',
    assignedBy: 'dacian',
    dueDate: '2026-04-12',
    status: 'pending',
    priority: 'high',
  },
]
