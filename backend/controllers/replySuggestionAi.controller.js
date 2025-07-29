import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from 'dotenv';

dotenv.config();

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Changed to named export
const generateReplySuggestions = async (req, res) => {
  try {
    const { message, subject, name } = req.body;

    if (!message || !subject) {
      return res.status(400).json({ error: "Both message and subject are required" });
    }

    // Personalized greeting
    const firstName = name ? name.split(' ')[0] : 'there';
    const greeting = `Dear ${firstName},`;

    // Subject-specific context prompts (modified to be more directive)
    const subjectContexts = {
      'financial assistance': `As a financial advisor, generate 3 professional response variations to this request for financial assistance: "${message}". Responses should offer specific help options.`,
      'investment strategy discussion': `As a financial advisor, generate 3 professional response variations to this investment strategy inquiry: "${message}". Responses should discuss risk tolerance and time horizon.`,
      'retirement planning consultation': `As a financial advisor, generate 3 professional response variations to this retirement planning question: "${message}". Responses should consider age and income needs.`,
      'general inquiry': `As a customer service representative, generate 3 professional response variations to this general inquiry: "${message}".`,
      default: `Generate 3 professional response variations to this ${subject.toLowerCase()} inquiry: "${message}".`
    };

    const selectedContext = subjectContexts[subject.toLowerCase()] || subjectContexts.default;
    const fullPrompt = `${greeting}\n\n${selectedContext}\n\nResponses should:\n- Be concise (1-2 sentences)\n- Offer specific help\n- Sound professional`;

    const modelsToTry = [
      "amazon.titan-text-express-v1",
      "anthropic.claude-v2"
    ];

    let lastError;
    let suggestions;

    for (const modelId of modelsToTry) {
      try {
        const input = {
          modelId,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(modelId.includes('titan') ? {
            inputText: fullPrompt,
            textGenerationConfig: {
              maxTokenCount: 400,
              temperature: 0.7,
              topP: 0.9
            }
          } : {
            prompt: `\n\nHuman: ${fullPrompt}\n\nAssistant: Here are 3 response variations:\n1.`,
            max_tokens_to_sample: 500,
            temperature: 0.7
          })
        };

        const command = new InvokeModelCommand(input);
        const response = await client.send(command);
        const responseBody = JSON.parse(Buffer.from(response.body).toString());
        
        let generatedText = modelId.includes('titan') 
          ? responseBody.results[0].outputText.trim()
          : responseBody.completion.trim();

        // Parse the responses into an array
        suggestions = generatedText.split('\n')
          .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbered list prefix
          .filter(line => line.length > 0 && !line.startsWith('Here are three professional responses')) // Filter out intro text
          .slice(0, 3); // Keep only top 3 responses

        // Ensure we have exactly 3 suggestions
        if (suggestions.length < 3) {
          suggestions = [
            ...suggestions,
            `${greeting} Thank you for your message. We'll follow up with you shortly.`,
            `${greeting} We've received your ${subject.toLowerCase()} inquiry and will respond soon.`
          ].slice(0, 3);
        }


        break;
      } catch (error) {
        lastError = error;
        console.warn(`Attempt with ${modelId} failed:`, error.message);
        continue;
      }
    }

    if (!suggestions) {
      throw lastError || new Error("All model attempts failed");
    }

    res.json(suggestions);

  } catch (error) {
    console.error("AI Generation Error:", error);
    
    const fallbackSuggestions = [
      `Thank you for your message about ${req.body.subject || 'your inquiry'}. We'll respond shortly.`,
      `We've received your ${req.body.subject || 'inquiry'} and will get back to you soon.`,
      `Thank you for contacting us about ${req.body.subject || 'this matter'}.`
    ];

    res.status(500).json(fallbackSuggestions);
  }
};

export default generateReplySuggestions;