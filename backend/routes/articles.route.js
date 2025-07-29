import express from 'express';
import { processArticleWithClaude } from '../lib/broadcastAI.js';
import { fetchArticleContent } from '../controllers/article.controller.js';

const router = express.Router();

// POST request to analyze the article
router.post('/analyze', async (req, res) => {
  const { articleContent } = req.body; // Get the article content from the frontend

  // Log the incoming content to ensure it's not empty or malformed
  console.log('Received article content:', articleContent);

  try {
    if (!articleContent || articleContent.trim() === '') {
      throw new Error('Article content is empty');
    }

    // Process the article with Claude
    const analysisResult = await processArticleWithClaude(articleContent);

    // Log the full AI response to inspect the output
    console.log('AI analysis result:', analysisResult);

    // Extract necessary fields from the AI result
    const { title, listName, tags, topics } = analysisResult;

    // Log the extracted fields for debugging purposes
    console.log('Extracted AI Data:', { title, listName, tags, topics });

    // Return the extracted data to the frontend
    res.json({ title, listName, tags, topics });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error processing article:', error.message);
    res.status(500).json({ message: 'Failed to analyze article', error: error.message });
  }
});

// Route to fetch article content
router.post('/fetch-article', fetchArticleContent);

export default router;
