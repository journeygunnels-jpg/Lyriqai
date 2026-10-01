// Vercel serverless function — generates songs, beat sheets, or title ideas via Claude
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    try {
      const { prompt, type } = JSON.parse(body);

      if (!prompt || !prompt.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'A prompt is required.' }));
      }

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Anthropic API key is not configured. Set ANTHROPIC_API_KEY to enable generation.'
        }));
      }

      const typeLabels = {
        song: 'a complete song with verses, a chorus, and a bridge',
        beat: 'a beat sheet / song structure (intro, verse, chorus, bridge, outro with timing notes)',
        titles: '10 creative, catchy title ideas',
      };
      const typeLabel = typeLabels[type] || typeLabels.song;

      const systemPrompt =
        'You are Lyriqai, an expert AI songwriter and music producer. ' +
        'You write compelling, original lyrics with strong imagery, rhythm, and emotional resonance. ' +
        'Format your output clearly with section headers.';

      const userPrompt =
        `Write ${typeLabel} about: ${prompt.trim()}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', response.status, errorText);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: `Claude API error (${response.status}).` }));
      }

      const data = await response.json();
      const text = data.content?.map((block) => block.text).join('\n') || '';

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: text }));
    } catch (err) {
      console.error('Generate error:', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Failed to generate.' }));
    }
  });
};
