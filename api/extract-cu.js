export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { pdfBase64 } = req.body
  if (!pdfBase64) return res.status(400).json({ error: 'Missing pdfBase64' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          },
          {
            type: 'text',
            text: `Extrage din acest Certificat de Urbanism românesc EXACT informațiile de mai jos și returnează DOAR un JSON valid, fără text suplimentar, fără markdown.

Câmpurile principale:
- "name": scopul/denumirea proiectului din CU
- "certificat": numărul CU cu data (ex: "nr. 20/24.03.2026")
- "address": județul, comuna, nr. cadastrale
- "emitent": instituția emitentă (ex: "Primăria Comunei Valea Nucărilor, jud. Tulcea")  
- "dataEmitere": data emiterii format YYYY-MM-DD
- "dataExpirare": dataEmitere + valabilitate menționată în CU, format YYYY-MM-DD
- "titular": numele titularului/solicitantului
- "scopul": scopul complet din CU

Câmpul "procedures": array cu TOATE avizele și acordurile menționate în secțiunea "CEREREA DE EMITERE A AUTORIZATIEI" sau "avize și acorduri" din CU.
Extrage TOATE avizele din d.1, d.2, d.3, d.4 și orice altă secțiune care menționează avize necesare.
Fiecare procedură are forma: { "name": "Denumirea avizului/acordului" }

Exemplu de răspuns:
{
  "name": "Realizare Centrală Electrică Hibrid",
  "certificat": "nr. 20/24.03.2026",
  "address": "Jud. Tulcea, Com. Valea Nucărilor, nr. cad. 44415, 44432, 44525, 30812",
  "emitent": "Primăria Comunei Valea Nucărilor, jud. Tulcea",
  "dataEmitere": "2026-03-24",
  "dataExpirare": "2028-03-24",
  "titular": "Blue Line Energy SRL",
  "scopul": "Realizare Centrală Electrică Hibrid - Construire Baterie de Stocare",
  "procedures": [
    { "name": "Aviz alimentare cu energie electrică" },
    { "name": "Aviz salubritate" },
    { "name": "Aviz securitate la incendiu — ISU" },
    { "name": "Aviz protecție civilă" },
    { "name": "Aviz sănătatea populației" },
    { "name": "Aviz DJCCPCN — Direcția Județeană pentru Cultură" },
    { "name": "Acord acces drumuri exploatare — Primăria Valea Nucărilor" },
    { "name": "Aviz Direcția Lucrări Publice Drumuri Județene" },
    { "name": "Acord de Mediu — APM Tulcea" },
    { "name": "Studiu geotehnic" },
    { "name": "Viză verificator de proiecte atestat" },
    { "name": "Extras Carte Funciară actualizat" },
    { "name": "Documentație tehnică DTAC" },
    { "name": "Autorizație de Construire" }
  ]
}

Dacă un câmp nu se găsește, pune string gol "" sau array gol [].`,
          },
        ],
      }],
    }),
  })

  const data = await response.json()
  if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error' })

  const text = data.content?.find(b => b.type === 'text')?.text || ''
  const clean = text.replace(/```json|```/g, '').trim()

  try {
    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch {
    return res.status(500).json({ error: 'Could not parse response', raw: clean })
  }
}
