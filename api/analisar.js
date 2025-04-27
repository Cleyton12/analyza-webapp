export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'Arquivo não enviado' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um analista de gráficos de mercado. Analise a imagem enviada e diga se o padrão é de COMPRA ou VENDA, explicando em uma linha curta.' },
          { role: 'user', content: [{ type: 'image', image: { base64: base64 } }] }
        ],
        max_tokens: 300
      })
    });

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error(openaiData);
      return new Response(JSON.stringify({ error: openaiData.error.message || 'Erro OpenAI' }), { status: 500 });
    }

    const resultado = openaiData.choices?.[0]?.message?.content || 'Não foi possível analisar.';

    return new Response(JSON.stringify({ resultado }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 });
  }
                        }
