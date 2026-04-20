export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // CORS: permite llamadas desde tu GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', 'https://hooverthy.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El campo prompt es requerido' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // 🔒 la key vive aquí, nunca visible
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Error en la API de Claude' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
