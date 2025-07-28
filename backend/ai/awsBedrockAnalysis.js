import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { v4 as uuidv4 } from 'uuid';

const bedrockClient = new BedrockRuntimeClient({ region: "ap-southeast-2" });

export async function analyzeMessagesWithBedrock(messages) {
  const keywords = ["zoom", "discuss", "meet up", "call", "meet"];

  const messagesWithIds = messages.map(msg => ({
    ...msg,
    id: uuidv4()
  }));

  const prompt = [
    "You are a JSON output machine. Follow these strict rules:",
    `1. Identify messages containing these keywords: ${JSON.stringify(keywords)}`,
    "2. Include the original contact name with each flagged message",
    "3. Format output as: {\"flagged_messages\": [{\"contact\":\"Name\", \"text\":\"message\"}]}",
    "4. Preserve all original message content and metadata",
    "",
    "Messages to analyze:",
    JSON.stringify(messagesWithIds, null, 2)
  ].join("\n");

  const params = {
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [{ type: "text", text: prompt }]
      }]
    })
  };

  try {
    const response = await bedrockClient.send(new InvokeModelCommand(params));
    const result = JSON.parse(Buffer.from(response.body).toString());

    // Try to parse Claude's text response
    const parsedResponse = JSON.parse(result.content[0].text);

    const flaggedMessages = messagesWithIds.filter(msg =>
      parsedResponse.flagged_messages.some(f =>
        f.text === msg.text && f.contact === msg.contact
      )
    );

    return flaggedMessages;
  } catch (err) {
    console.error("Bedrock analysis error:", err);
    throw new Error("Invalid contact name");
  }
}
