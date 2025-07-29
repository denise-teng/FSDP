import express from 'express';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const router = express.Router();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/', async (req, res) => {
  try {
    const { prompt, model = 'titan-text-express' } = req.body;
    console.log("Received request with body:", req.body); 
    
    if (!prompt) {
      console.log("Error: No prompt provided");
      return res.status(400).json({ message: 'Prompt is required' });
    }

    console.log("Received prompt:", prompt);

    const input = {
      modelId: 'amazon.titan-text-express-v1',
      contentType: 'application/json',
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 2048,
          temperature: 0.7,
          topP: 0.9
        }
      })
    };

    console.log("Preparing to send request to AWS Bedrock with input:", input);

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    const result = JSON.parse(Buffer.from(response.body).toString('utf-8'));
    
    console.log("Received response from AWS Bedrock:", result);

    res.json({
      generatedText: result.results?.[0]?.outputText || 'No content generated'
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate content'
    });
  }
});

export default router;