import { promises as fs } from 'fs';
import { PdfReader } from 'pdfreader';
import mammoth from 'mammoth';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";


// Initialize Bedrock client with ap-southeast-2 region
const bedrockClient = new BedrockRuntimeClient({ 
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Claude 3 Haiku Model ID
const MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

// Helper function to check file existence
const fileExists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

// Extract text from PDF using pdfreader
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    let text = '';
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        console.error('PDF Parsing Error:', err);
        reject(new Error('Failed to process PDF file'));
      } else if (!item) {
        resolve(text);
      } else if (item.text) {
        text += item.text + ' ';
      }
    });
  });
};

// Extract text from DOCX
const extractTextFromDocx = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } catch (error) {
    console.error('DOCX Extraction Error:', error);
    throw new Error('Failed to process DOCX file');
  }
};

const parseAIResponse = (aiText) => {
  const improvements = [];
  const seenSuggestions = new Set(); // Track unique suggestions
  
  // First split by major sections
  const sections = aiText.split(/(?=\nSection:)/).filter(s => s.trim());
  
  sections.forEach(section => {
    try {
      // Extract components
      const sectionMatch = section.match(/Section:\s*(.*?)(\n|$)/i);
      const currentMatch = section.match(/Current:\s*(.*?)(\n|$)/i);
      const suggestionMatch = section.match(/Suggestion:\s*(.*?)(\n|$)/i);
      const reasonMatch = section.match(/Reason:\s*(.*?)(\n|$)/i);

      if (sectionMatch && currentMatch && suggestionMatch) {
        const suggestionKey = `${sectionMatch[1]}-${suggestionMatch[1]}`.toLowerCase();
        
        // Only add if we haven't seen this suggestion before
        if (!seenSuggestions.has(suggestionKey)) {
          seenSuggestions.add(suggestionKey);
          
          improvements.push({
            section: sectionMatch[1].trim(),
            current: currentMatch[1].trim(),
            suggestion: suggestionMatch[1].trim(),
            reason: reasonMatch?.[1]?.trim() || 'Improvement suggested by AI'
          });
        }
      }
    } catch (e) {
      console.error('Error parsing AI section:', e);
    }
  });

  // Fallback if no structured suggestions found
  if (improvements.length === 0) {
    return [{
      section: "General Content",
      current: "Unable to parse specific sections",
      suggestion: "Review the overall structure and clarity",
      reason: "The AI provided general feedback"
    }];
  }

  return improvements;
};

const analyzeContentWithAI = async (text) => {
  try {
    // Truncate text to stay within reasonable limits (Claude 3 Haiku supports 200k tokens)
    const content = text.length > 100000 ? text.substring(0, 100000) + '...' : text;
    
    const prompt = `Please analyze this newsletter content and provide specific improvement suggestions.
    For each suggestion, provide in this exact format:
    
    Section: [section identifier]
    Current: [current text excerpt]
    Suggestion: [improvement suggestion]
    Reason: [reason for improvement]
    
    Content to analyze:
    ${content}`;

    const params = {
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [{
          role: "user",
          content: [{ type: "text", text: prompt }]
        }],
        max_tokens: 2000,
        temperature: 0.5,
        top_p: 0.9
      })
    };

    console.log('Sending to Claude 3 Haiku with content length:', content.length);
    
    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);
    const result = JSON.parse(Buffer.from(response.body).toString('utf-8'));

    if (!result.content || !Array.isArray(result.content) || !result.content[0].text) {
      throw new Error('Invalid response format from Claude 3');
    }

    return parseAIResponse(result.content[0].text);
  } catch (error) {
    console.error('Claude 3 Haiku Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      region: bedrockClient.config.region
    });
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

export const analyzeNewsletter = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { path: filePath, mimetype } = req.file;
    let text;

    // Extract text based on file type
    switch (mimetype) {
      case 'application/pdf':
        text = await extractTextFromPDF(filePath);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await extractTextFromDocx(filePath);
        break;
      case 'text/plain':
        text = await fs.readFile(filePath, 'utf-8');
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Analyze with AWS Bedrock
    const improvements = await analyzeContentWithAI(text);

    // Clean up the uploaded file
    await fs.unlink(filePath).catch(err => console.error('File cleanup error:', err));

    return res.json({ 
      success: true, 
      improvements,
      textLength: text.length
    });
    
  } catch (error) {
    console.error('Controller Error:', error);
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(cleanupError => {
        console.error('File cleanup failed:', cleanupError);
      });
    }
    return res.status(500).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};