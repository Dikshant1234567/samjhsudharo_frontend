export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? '').trim();
    const content = String(body.content ?? '').trim();
    const tone = String(body.tone ?? 'friendly').trim();

    if (!title && !content) {
      return new Response(JSON.stringify({ error: 'Missing title/content' }), { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = String(process.env.GEMINI_MODEL || 'gemini-1.5-flash');

    if (!apiKey) {
      return new Response(JSON.stringify({ title, content, summary: content.slice(0, 120), note: 'Gemini key not set — used heuristic rewrite.' }), { status: 200 });
    }

    // Use query param for API key for better REST reliability
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    ];

    const prompt = [
      'Rewrite the following for clarity and engagement. Maintain facts and friendly tone.',
      `Tone: ${tone}`,
      'Return JSON with keys: title, content, summary (<=40 words).',
      'Input:',
      `Title: ${title || '(none)'}`,
      `Content: ${content || '(none)'}`,
    ].join('\n');

    let resp: Response | null = null;
    let lastErrText = '';

    // Optional timeout to avoid hanging fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    for (const url of endpoints) {
      try {
        resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // removed 'x-goog-api-key' header; using query param instead
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
          }),
          signal: controller.signal,
        });
      } catch (err: any) {
        lastErrText = err?.message ?? String(err);
        resp = null;
      } finally {
        clearTimeout(timeout);
      }

      if (!resp) continue;

      if (resp.status === 404) {
        try { lastErrText = (await resp.text()).slice(0, 200); } catch {}
        continue;
      }

      break;
    }

    if (!resp) {
      return new Response(JSON.stringify({ error: `Failed to call Gemini API: ${lastErrText}` }), { status: 502 });
    }

    if (!resp.ok) {
      // Read error body once, parse if JSON
      let rawErrText = '';
      try { rawErrText = await resp.text(); } catch {}
      let payload: any = null;
      try { payload = JSON.parse(rawErrText); } catch {}

      const code = payload?.error?.code ?? payload?.error?.status ?? resp.status;
      const message =
        payload?.error?.message
        || (rawErrText || '').trim()
        || resp.statusText
        || 'Unknown LLM error';

      // Graceful quota/rate-limit fallback
      if (code === 'insufficient_quota' || resp.status === 429 || /quota|rate limit/i.test(message)) {
        return new Response(JSON.stringify({ title, content, summary: content.slice(0, 120), note: 'AI quota exceeded — used heuristic rewrite.' }), { status: 200 });
      }

      return new Response(JSON.stringify({ error: `LLM error (${code}): ${message}` }), { status: resp.status || 500 });
    }

    const data = await resp.json().catch(() => ({}));

    // API can return different shapes. Try several common ones:
    // 1) SDK-like: data.candidates[].content[].text or data.candidates[].content[0].text
    // 2) OpenAI-like wrappers: data.choices[0].message.content (string)
    // 3) SDK helper 'text' (some SDKs expose response.text)
    // 4) raw string in data.output or data.result
    let rawText = '';

    // (A) candidates -> content -> parts/text
    try {
      const cand = data?.candidates?.[0];
      if (cand) {
        // candidate may contain "content" array with "parts" or "text" fields
        const contentBlocks = cand?.content ?? cand?.output ?? null;
        if (Array.isArray(contentBlocks)) {
          // try many nested shapes
          for (const block of contentBlocks) {
            if (typeof block === 'string') rawText += (rawText ? '\n' : '') + block;
            else if (block?.text) rawText += (rawText ? '\n' : '') + block.text;
            else if (Array.isArray(block?.parts)) {
              for (const p of block.parts) {
                if (typeof p === 'string') rawText += (rawText ? '\n' : '') + p;
                else if (p?.text) rawText += (rawText ? '\n' : '') + p.text;
              }
            }
          }
        } else if (typeof cand?.text === 'string') {
          rawText = cand.text;
        }
      }
    } catch (e) {}

    // (B) choices -> message -> content (OpenAI-like)
    if (!rawText && Array.isArray(data?.choices)) {
      try {
        const ch = data.choices[0];
        // either message.content (string) or message.content.parts...
        if (typeof ch?.message?.content === 'string') rawText = ch.message.content;
        else if (Array.isArray(ch?.message?.content?.parts)) {
          rawText = ch.message.content.parts.map((p: any) => p.text ?? p).join('\n');
        }
      } catch (e) {}
    }

    // (C) top-level 'text' helper (SDK)
    if (!rawText && typeof data?.text === 'string') {
      rawText = data.text;
    }

    // (D) other fallbacks
    if (!rawText) {
      // try any obvious place
      if (typeof data?.output === 'string') rawText = data.output;
      else if (typeof data?.result === 'string') rawText = data.result;
      else rawText = JSON.stringify(data).slice(0, 2000);
    }

    // Expect the assistant to return JSON per our prompt. Try parse; fallback to naive parsing.
    let improvedTitle = title;
    let improvedContent = content;
    let summary = '';

    try {
      const parsed = JSON.parse(rawText);
      improvedTitle = String(parsed?.title ?? title);
      improvedContent = String(parsed?.content ?? content);
      summary = String(parsed?.summary ?? '');
    } catch {
      // naive fallback: first non-empty line -> title, rest -> content, last line -> possible summary
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length) {
        improvedTitle = lines[0] || title;
        if (lines.length >= 2) {
          summary = lines[lines.length - 1] || '';
          improvedContent = lines.slice(1, lines.length - (summary ? 1 : 0)).join('\n').trim() || content;
        } else {
          improvedContent = lines.slice(1).join('\n') || content;
        }
      }
    }

    return new Response(JSON.stringify({ title: improvedTitle, content: improvedContent, summary }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
}
export const runtime = 'nodejs';
