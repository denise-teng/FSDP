import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateReplySuggestions = async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for replying to business WhatsApp messages.',
        },
        {
          role: 'user',
          content: `Generate 3 polite reply suggestions for this WhatsApp message: "${message}"`,
        },
      ],
      temperature: 0.7,
    });

    const suggestions = response.choices[0].message.content
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());

    res.json({ replies: suggestions });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate AI replies' });
  }
};
