import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

const bedrockRuntime = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  apiVersion: '2023-09-30',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
});

// ================== CONTENT FETCHING ================== //
export const fetchArticleContent = async (url) => {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      },
      timeout: 10000
    });
    const $ = cheerio.load(res.data);

    // Priority content extraction
    const articleText = $('article').text()
      || $('[itemprop="articleBody"]').text()
      || $('.article-content, .post-content, main').text()
      || $('body').text();

    const cleanedText = articleText
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .trim();

    console.log("Article content fetched: ", cleanedText);  // Log the fetched content
    return cleanedText;
  } catch (err) {
    console.error("Scraping failed:", err.message);
    return null;
  }
};

// ================== AI PROCESSING ================== //
export const processArticleWithClaude = async (articleContent) => {
  if (!articleContent) {
    console.error('No article content provided');
    throw new Error('Article content is required for AI processing');
  }

  const analysisPrompt = `
    Analyze this article and generate SPECIFIC outputs. If the content is unclear, provide a generic response.

    TITLE (5-7 words):
    - Include relevant proper nouns, numbers, or entities from the content.
    - Do not use: "Update", "Report", or dates.

    AUDIENCE (2-3 words):
    - Define the audience based on the content's context (e.g., Developers, Investors, etc.).
    - Do not use: "Target Audience" or "Readers".

    TAGS (3 items):
    - Identify key concrete terms.
    - Do not use: "General" or "News".

    Respond ONLY in this exact JSON format:
    {
      "title": "",
      "audience": "",
      "tags": []
    }

    Article Content:
    ${articleContent.substring(0, 10000)}  // Ensure we're sending the full content to Claude
  `;

  console.log('Generated AI Prompt:', analysisPrompt);  // Log the prompt to see what's being sent to AI

  try {
    const params = {
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [{
          role: "user",
          content: analysisPrompt
        }],
        max_tokens: 1000,
        temperature: 0.7
      })
    };

    const response = await bedrockRuntime.invokeModel(params).promise();
    const result = JSON.parse(response.body.toString());
    console.log('AI Response:', result);  // Log the full AI response

    const content = result.content[0].text;

    // Strict JSON extraction
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract valid JSON from AI response');
      throw new Error('Failed to process AI output');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      title: enforceTitle(analysis.title, articleContent),
      listName: enforceAudience(analysis.audience, articleContent),
      tags: enforceTags(analysis.tags, articleContent),
      topics: extractKeywords(articleContent)
    };

  } catch (error) {
    console.error('AI Processing Error:', error);  // Log the error that occurred during AI processing
    throw error;  // Re-throw the error to be caught in the route
  }
};


// ================== ENFORCEMENT HELPERS ================== //
function enforceTitle(title, content) {
  if (!title || /industry update|weekly|digest|report|\d{1,2}\/\d{1,2}\/\d{4}/i.test(title)) {
    // Dynamically create a title from content
    const properNouns = [...new Set(content.match(/([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)+/g) || [])];
    console.log("Proper Nouns Extracted: ", properNouns);  // Log proper nouns extracted
    return properNouns.length
      ? `${properNouns.slice(0, 2).join(' ')} Analysis`
      : content.split(/\s+/).slice(0, 5).join(' ') + " Insights";
  }
  return title.substring(0, 60).trim();  // Enforce max length for title
}

function enforceAudience(audience, content) {
  const forbidden = ["target audience", "general readers", "all users"];
  if (!audience || forbidden.some(f => audience.toLowerCase().includes(f))) {
    if (content.match(/\$|\b(invest|stock|fund)\b/i)) return "Investors";
    if (content.match(/\b(code|tech|software)\b/i)) return "Developers";
    if (content.match(/\b(health|medical|patient)\b/i)) return "Healthcare Professionals";
    if (content.match(/\b(child|parent|family)\b/i)) return "Parents";
    return "Industry Professionals";
  }
  return audience.substring(0, 30).trim();
}

function enforceTags(tags, content) {
  const forbiddenTags = ["general", "update", "news"];
  const validTags = (Array.isArray(tags) ? tags : [])
    .filter(t => t && !forbiddenTags.includes(t.toLowerCase()))
    .slice(0, 3);
  return validTags.length ? validTags : extractKeywords(content).slice(0, 3);
}

// ================== CONTENT ANALYSIS ================== //
function extractKeywords(content) {
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freqMap = {};
  words.forEach(word => freqMap[word] = (freqMap[word] || 0) + 1);

  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter(w => !['this', 'that', 'with', 'have', 'from'].includes(w))
    .slice(0, 5);
}

function generateNuclearFallback(content) {
  const keywords = extractKeywords(content);
  return {
    title: keywords.slice(0, 3).join(' ') + " Analysis",
    listName: content.match(/\$/) ? "Financial Readers" : "Technical Audience",
    tags: keywords.slice(0, 3),
    topics: keywords
  };
}
