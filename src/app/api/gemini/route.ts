import { NextRequest } from 'next/server'

function validate(body: any) {
  const errors: Record<string, string> = {}
  const out: any = {}
  out.model = typeof body?.model === 'string' && body.model.trim() ? body.model : 'gemini-1.5-flash'
  out.system = typeof body?.system === 'string' ? body.system : (body?.system == null ? undefined : String(body.system))
  out.input = typeof body?.input === 'string' ? body.input : ''
  if (!out.input.trim()) errors.input = 'Input text is required'
  const imgs = Array.isArray(body?.images) ? body.images : []
  out.images = imgs.filter((x: any) => typeof x === 'string')
  return { ok: Object.keys(errors).length === 0, value: out, errors }
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}))
  const parsed = validate(json)
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: 'Invalid request', details: parsed.errors }), { status: 400 })
  }
  const { model, system, input, images } = parsed.value

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Gemini not configured. Set GOOGLE_API_KEY.' }), { status: 501 })
  }

  try {
    // Normalize images: accept data URLs or base64 raw; Gemini expects inline_data { mime_type, data }
    const normalize = (s: string) => {
      if (s.startsWith('data:')) {
        // data:[mime];base64,[data]
        const [, meta, data] = s.match(/^data:([^;]+);base64,(.*)$/) || [] as any
        if (meta && data) return { mime_type: meta, data }
        // fallback: unknown data URL format
        return { mime_type: 'image/*', data: s.split(',').pop() || '' }
      }
      return { mime_type: 'image/*', data: s }
    }
    const parts: any[] = []
    if (system && system.trim()) parts.push({ text: `(system) ${system}` })
    parts.push({ text: String(input) })
    for (const img of images) {
      const { mime_type, data } = normalize(img)
      if (data) parts.push({ inlineData: { mimeType: mime_type, data } })
    }

    const payload: any = {
      contents: [
        {
          role: 'user',
          parts
        }
      ],
      ...(system && system.trim() ? { systemInstruction: { role: 'system', parts: [{ text: system }] } } : {})
    }

    // Debug (sanitized): log request structure without base64
    try {
      const dbgParts = parts.map((p: any) => p.text ? { text: String(p.text).slice(0,80) } : (p.inlineData ? { inlineData: { mimeType: p.inlineData.mimeType, dataLen: (p.inlineData.data?.length||0) } } : {}))
      console.log('[GEMINI] Request', { model, hasKey: !!apiKey, hasSystem: !!system, parts: dbgParts })
    } catch {}

    const is25 = model.startsWith('gemini-2.5-')
    const url = is25
      ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
      : `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    // Prefer header for key to match working curl
    headers['X-Goog-Api-Key'] = apiKey

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    const respText = await resp.text()
    if (!resp.ok) {
      try { console.error('[GEMINI] Upstream error', { status: resp.status, body: respText?.slice(0,500) }) } catch {}
      return new Response(JSON.stringify({ error: 'Upstream error', details: respText }), { status: 500 })
    }

    let out: any = {}
    try { out = JSON.parse(respText) } catch { out = {} }
    const output = out?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') ?? ''
    return Response.json({ output })
  } catch (e: any) {
    try { console.error('[GEMINI] Handler error', e) } catch {}
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 })
  }
}
