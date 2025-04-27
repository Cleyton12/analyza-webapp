export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405 });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Imagem não enviada' }), { status: 400 });
    }

    // Sua API KEY aqui (você pode usar variável de ambiente depois)
    const OPENAI_API_KEY = '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';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista de mercado especializado em análise gráfica de criptomoedas.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analise essa imagem de gráfico e me diga se é melhor comprar ou vender.' },
              { type: 'image', image: { base64_data: imageBase64 } },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ result: data.choices[0].message.content }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro interno ao processar a imagem.' }), { status: 500 });
  }
}
