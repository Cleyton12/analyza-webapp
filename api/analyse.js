import { IncomingForm } from 'formidable-serverless';
import { promises as fs } from 'fs';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Agora usando ENV VAR! Melhor!
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro ao fazer upload:', err);
      return res.status(500).json({ error: 'Erro no upload do arquivo' });
    }

    const file = files.file;
    if (!file || !file[0]) {
      return res.status(400).json({ error: 'Arquivo não encontrado' });
    }

    try {
      const fileBuffer = await fs.readFile(file[0].filepath);
      const base64Image = fileBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analise esse gráfico e diga se a tendência é de compra ou venda. Seja direto." },
              { type: "image", image: { base64: base64Image } }
            ]
          }
        ]
      });

      const message = response.choices[0]?.message?.content || "Não foi possível analisar.";
      return res.status(200).json({ message });
    } catch (error) {
      console.error('Erro ao consultar OpenAI:', error);
      return res.status(500).json({ error: 'Erro ao processar imagem.' });
    }
  });
}
