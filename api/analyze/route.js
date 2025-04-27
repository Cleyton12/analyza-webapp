export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { base64 } = await req.json ? await req.json() : req.body;

  if (!base64) {
    return res.status(400).json({ error: "Imagem não enviada" });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer SUA_API_KEY_AQUI`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Você é um analista técnico de gráficos financeiros.
Analise a imagem enviada do gráfico e diga se o padrão atual indica uma oportunidade de COMPRA ou de VENDA.

Se o gráfico estiver lateralizado ou sem um padrão claro de alta ou baixa, diga: "Mercado indefinido. Melhor aguardar confirmação de tendência."

Se identificar tendência de alta, diga: "Sinal de COMPRA."
Se identificar tendência de baixa, diga: "Sinal de VENDA."

Seja objetivo, diga apenas a orientação em no máximo 2 linhas.

Depois da análise principal, finalize sugerindo cautela, pois análise gráfica não garante 100% de certeza.`,
              },
              {
                type: "image",
                image: {
                  base64: base64
                }
              }
            ]
          }
        ],
        max_tokens: 400
      })
    });

    const openaiData = await openaiRes.json();

    if (openaiData.error) {
      return res.status(400).json({ error: openaiData.error.message });
    }

    const respostaIA = openaiData.choices?.[0]?.message?.content || "Não foi possível gerar uma análise.";

    res.status(200).json({ resultado: respostaIA });

  } catch (err) {
    console.error("Erro ao chamar a API da OpenAI:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
