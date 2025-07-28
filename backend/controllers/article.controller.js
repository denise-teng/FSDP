import axios from 'axios';
import * as cheerio from 'cheerio';

// Function to fetch article content from the provided URL
export const fetchArticleContent = async (req, res) => {
  const { url } = req.body;

  try {
    // Fetch article using Axios
    const response = await axios.get(url);

    // Load the HTML page content using Cheerio
    const $ = cheerio.load(response.data);

    // Extract the article content. Adjust the selector based on the website structure
    const articleContent = $('article').text() || $('[itemprop="articleBody"]').text() || $('.post-content').text() || $('body').text();

    // If content is found, return it; otherwise, send an error response
    if (articleContent) {
      res.json({ content: articleContent.trim() });
    } else {
      res.status(404).json({ message: 'Article content not found' });
    }
  } catch (error) {
    console.error('Error fetching article content:', error);
    res.status(500).json({ message: 'Error fetching article content' });
  }
};
