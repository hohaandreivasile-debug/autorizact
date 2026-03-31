# AutorizAct — Managementul Autorizațiilor de Construire

Aplicație web pentru gestionarea certificatelor de urbanism, proceduri de autorizare, documente, comentarii și sarcini de echipă.

## Utilizatori preconfigurati
| Utilizator | Rol | Acces |
|---|---|---|
| Dacian Nath | Administrator | Toate funcțiile + asignare sarcini |
| Raccosta Giorgio | Utilizator | Proiecte, proceduri, documente |
| Sorin Terpe | Utilizator | Proiecte, proceduri, documente |

---

## 1. Rulare locală (fără Supabase)

```bash
# 1. Instalează dependențele
npm install

# 2. Pornește serverul de dezvoltare
npm run dev
```

Aplicația rulează la **http://localhost:5173**

> Fără fișierul `.env.local`, aplicația funcționează complet local în memorie (datele se resetează la refresh). Ideal pentru testare UI.

---

## 2. Configurare Supabase (cloud sync)

### Pasul 1 — Creează proiectul Supabase
1. Mergi la [supabase.com](https://supabase.com) → **New Project**
2. Alege o regiune apropiată (ex: `eu-central-1`)
3. Setează o parolă puternică pentru baza de date

### Pasul 2 — Crează schema bazei de date
1. În Supabase → **SQL Editor** → **New query**
2. Copiază conținutul fișierului `supabase_schema.sql` și execută-l
3. Verifică că tabelele au apărut în **Table Editor**

### Pasul 3 — Crează bucket pentru documente
1. În Supabase → **Storage** → **New bucket**
2. Name: `documents`
3. **Public bucket**: `false` (privat)
4. Click **Create bucket**

### Pasul 4 — Obține cheile API
1. În Supabase → **Settings** → **API**
2. Copiază:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### Pasul 5 — Creează `.env.local`
```bash
cp .env.example .env.local
```
Editează `.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Pasul 6 — Repornește aplicația
```bash
npm run dev
```

La prima deschidere, aplicația va **popula automat** Supabase cu datele demo. Toate modificările se sincronizează în timp real între utilizatori.

---

## 3. Deploy pe Vercel

### Pasul 1 — Git repository
```bash
git init
git add .
git commit -m "feat: initial AutorizAct"

# Creează repo pe GitHub, apoi:
git remote add origin https://github.com/USER/autorizact.git
git push -u origin main
```

### Pasul 2 — Import în Vercel
1. Mergi la [vercel.com](https://vercel.com) → **New Project**
2. **Import** repository-ul de pe GitHub
3. Framework Preset: **Vite** (detectat automat)
4. Click **Deploy** → prima build va eșua fără env vars

### Pasul 3 — Adaugă variabilele de mediu
1. În Vercel → proiectul tău → **Settings** → **Environment Variables**
2. Adaugă:
   - `VITE_SUPABASE_URL` = URL-ul proiectului Supabase
   - `VITE_SUPABASE_ANON_KEY` = cheia anon Supabase
3. **Redeploy** → Settings → Deployments → Redeploy

### Pasul 4 — URL final
Vercel îți oferă un URL de tipul: `https://autorizact-xxx.vercel.app`

---

## Structura proiectului

```
autorizact/
├── src/
│   ├── components/
│   │   ├── LoginScreen.jsx     # Ecran selectare profil
│   │   ├── Sidebar.jsx         # Navigare laterală
│   │   └── UI.jsx              # Componente reutilizabile
│   ├── hooks/
│   │   ├── useSync.js          # Sincronizare Supabase + state
│   │   └── useVoice.js         # Dictare vocală (Web Speech API)
│   ├── lib/
│   │   ├── data.js             # Constante, helpers, seed data
│   │   └── supabase.js         # Client Supabase
│   ├── pages/
│   │   ├── Dashboard.jsx       # Panou principal + alerte
│   │   ├── ProjectList.jsx     # Lista proiecte
│   │   ├── ProjectDetail.jsx   # Proceduri + documente + comentarii
│   │   └── TasksView.jsx       # Sarcini
│   ├── App.jsx                 # Router principal
│   ├── main.jsx                # Entry point
│   └── index.css               # Stiluri globale
├── public/
│   └── icon.svg
├── supabase_schema.sql         # Schema SQL pentru Supabase
├── .env.example                # Template variabile de mediu
├── vercel.json                 # Configurare routing Vercel
├── vite.config.js
├── index.html
└── package.json
```

---

## Funcționalități

- ✅ **3 profiluri** — Dacian (admin), Raccosta, Sorin
- ✅ **Proiecte** — certificate de urbanism cu proceduri multiple
- ✅ **Proceduri** — tabs editabile, status, termene limită
- ✅ **Documente** — upload, download, delete (storage Supabase)
- ✅ **Comentarii** — text + dictare vocală (ro-RO)
- ✅ **Sarcini** — asignare, priorități, termene, filtrare
- ✅ **Alerte** — termene depășite pe dashboard
- ✅ **Sync real-time** — Supabase Realtime între utilizatori
- ✅ **Mod offline** — funcționează fără Supabase (date locale)
- ✅ **Deploy Vercel** — vercel.json inclus
