export const config = {
  maxDuration: 30,
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { pdfBase64 } = req.body
    if (!pdfBase64) return res.status(400).json({ error: 'Lipsește fișierul PDF.' })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Cheia API Anthropic nu este configurată pe Vercel. Adaugă variabila ANTHROPIC_API_KEY în Settings → Environment Variables.' })

    // Check size — base64 of 8MB PDF = ~11MB string, reject early
    if (pdfBase64.length > 14_000_000) {
      return res.status(400).json({ error: 'PDF prea mare (max ~8MB). Comprimă documentul și încearcă din nou.' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
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

Câmpul "procedures": array cu TOATE avizele și acordurile menționate în CU (secțiunile d.1, d.2, d.3, d.4).
Fiecare procedură: { "name": "Denumirea avizului/acordului" }

Dacă un câmp nu se găsește, pune string gol "" sau array gol [].
Răspunde DOAR cu JSON valid, nimic altceva.`,
            },
          ],
        }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errMsg = data.error?.message || JSON.stringify(data.error) || 'Eroare API Anthropic'
      return res.status(500).json({ error: `Eroare API: ${errMsg}` })
    }

    const text = data.content?.find(b => b.type === 'text')?.text || ''
    const clean = text.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, t => {
      // extract content inside fences
      return t.replace(/```json\n?|```\n?/g, '').trim()
    }).trim()

    try {
      const parsed = JSON.parse(clean)
      return res.status(200).json(parsed)
    } catch {
      // Try to extract JSON from text
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return res.status(200).json(JSON.parse(match[0]))
        } catch {}
      }
      return res.status(500).json({ error: 'Nu s-a putut parsa răspunsul AI. Încearcă din nou sau completează manual.', raw: clean.slice(0, 200) })
    }
  } catch (err) {
    return res.status(500).json({ error: `Eroare server: ${err.message}` })
  }
}
