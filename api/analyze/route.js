export const config = {
  runtime: 'edge', // obrigatório para funcionar como função Edge na Vercel
};

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Imagem não recebida.' }),
        { status: 400 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Observe o gráfico enviado e sugira: COMPRA ou VENDA baseado em suportes, resistências e tendência." },
              { type: "image", image: { base64: imageBase64 } }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify({
      analysis: data.choices?.[0]?.message?.content || 'Não foi possível gerar a análise.',
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
