import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
app.use(cors());                  // allow browser → server cross-origin (if any)
app.use(express.json());          // parse incoming JSON bodies
app.use(express.static('public'));// serve index.html, script.js, etc.

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/generate-clues', async (req, res) => {
  const { across, down } = req.body;
  if (!Array.isArray(across) || !Array.isArray(down)) {
    return res.status(400).json({ error: "Need across and down arrays" });
  }

  const userPrompt = `
I'm making a 5x5 crossword. Here are the answers:
Across:
1. ${across[0]}
2. ${across[1]}
3. ${across[2]}
4. ${across[3]}
5. ${across[4]}

Down:
1. ${down[0]}
2. ${down[1]}
3. ${down[2]}
4. ${down[3]}
5. ${down[4]}

Give me a concise, conversational clue for each, do not number the clues.
Return exactly valid JSON: { "acrossClues": [...], "downClues": [...] }.
`.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful crossword clue generator." },
        { role: "user",   content: userPrompt }
      ],
      temperature: 0.7
    });
    const text = completion.choices[0].message.content;
    const clues = JSON.parse(text);
    return res.json(clues);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
