// Estrutura base montada! Agora estou te entregando o primeiro arquivo: o analyze.js da API

import { NextResponse } from 'next/server';

export async function POST(req) { try { const { imageBase64 } = await req.json();

if (!imageBase64) {
  return NextResponse.json({ error: 'Imagem não fornecida.' }, { status: 400 });
}

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'system',
        content: 'Você é um analista de mercado financeiro. Analise o gráfico enviado de forma extremamente detalhada, comentando formações, padrões, tendências e sentimento do mercado.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analise detalhadamente esse gráfico:'
          },
          {
            type: 'image',
            image: { base64: imageBase64 }
          }
        ]
      }
    ],
    max_tokens: 1000
  })
});

const data = await response.json();
const content = data.choices?.[0]?.message?.content || 'Não foi possível gerar a análise.';

return NextResponse.json({ resultado: content });

} catch (error) { console.error(error); return NextResponse.json({ error: 'Erro interno ao processar.' }, { status: 500 }); } }

