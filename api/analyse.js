import formidable from 'formidable';
import fs from 'fs';
import { OpenAI } from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: "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",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro no form:', err);
      return res.status(500).json({ error: 'Erro no upload' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'Arquivo não encontrado' });
    }

    try {
      const fileData = fs.readFileSync(file[0].filepath);
      const base64Image = fileData.toString('base64');

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analise essa imagem de gráfico e diga se a tendência é de compra ou venda. Seja objetivo." },
              { type: "image", image: { base64: base64Image } }
            ]
          }
        ],
      });

      const mensagem = response.choices[0]?.message?.content || "Não foi possível analisar.";

      res.status(200).json({ message: mensagem });
    } catch (error) {
      console.error('Erro ao consultar OpenAI:', error);
      res.status(500).json({ error: 'Erro ao analisar a imagem.' });
    }
  });
}
