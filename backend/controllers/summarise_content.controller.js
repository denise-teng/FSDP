import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';



const bedrockClient = new BedrockRuntimeClient({ region: 'ap-southeast-2' });
const textractClient = new TextractClient({ region: 'ap-southeast-2' });

const MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

// Optional: Textract handler (still useful if you ever want OCR in the future)
async function extractTextWithTextract(buffer) {
  console.warn('Textract not used since no S3 object provided');
  return '';
}

// Extract text from PDF buffer (used in your flow)
async function extractTextFromBuffer(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parse error:', error);
    return null;
  }
}

// Build Claude-friendly prompt
const buildPrompt = (title, pdfContent, tags, category, audience) => {
  const tones = {
    'Financial Planning': 'professional yet approachable',
    'Insurance': 'clear and reassuring',
    'Estate Planning': 'detailed and sensitive',
    'default': 'engaging and conversational'
  };

  return `As a professional newsletter writer, create content based on the following information:

**Title**: ${title || "Untitled Newsletter"}
**Audience**: ${audience?.join(", ") || "General public"}
**Tone**: ${tones[category] || tones.default}

**Document Content**:
${pdfContent ? pdfContent.slice(0, 3000) + (pdfContent.length > 3000 ? '... [document truncated]' : '') : 'No document content provided'}

**Requirements**:
1. Start with a compelling hook
2. Include 2–3 key points from the document
3. Use clear headings
4. Add stats if applicable
5. Include a call-to-action

**Tags**: ${tags || "Not specified"}
**Category**: ${category || "General"}

Write the newsletter content below:
----------------------------------`;
};

// Main handler
export const generateContent = async (req, res) => {
  try {
    const { title, tags, category, audience, fileData, fileName } = req.body;

    if (!title && !fileData) {
      return res.status(400).json({
        success: false,
        error: 'Title or file is required'
      });
    }

    let pdfContent = '';

    if (fileData && fileName?.toLowerCase().endsWith('.pdf')) {
      try {
        const buffer = Buffer.from(fileData, 'base64');
        pdfContent = await extractTextFromBuffer(buffer);
        if (!pdfContent || pdfContent.length < 100) {
          console.warn('Extracted PDF content is empty or too short');
        }
      } catch (err) {
        console.error('Error parsing uploaded file:', err);
      }
    }

    const prompt = buildPrompt(title, pdfContent, tags, category, audience);

    const params = {
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        max_tokens: 1500,
        temperature: 0.5,
        top_p: 0.9
      })
    };

    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);
    const result = JSON.parse(Buffer.from(response.body).toString('utf-8'));

    if (!result?.content?.[0]?.text) {
      throw new Error('Invalid Claude response format');
    }

    res.json({
      success: true,
      content: result.content[0].text,
      documentUsed: !!pdfContent
    });
  } catch (error) {
    console.error('Content Generation Error:', error);
    res.status(500).json({
      success: false,
      error: `Content generation failed: ${error.message}`
    });
  }
};
