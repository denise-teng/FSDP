import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import crypto from 'crypto';  // Import crypto for randomUUID generation
import dotenv from 'dotenv';
dotenv.config();

const titanClient = new BedrockRuntimeClient({
    region: "ap-southeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Generates engagement recommendations for an admin based on user metrics
 * @param {Array} engagementData - Array of user engagement metrics
 * @param {string} adminId - ID of the admin to personalize recommendations
 * @returns {Promise<Array>} - Array of recommendation objects
 */
export async function generateAdminRecommendations(avgClicks, avgEngagingTime, avgReplies) {
    try {
        // Construct the prompt based on the average values
        const prompt = `
      You are an expert digital engagement consultant analyzing metrics for an admin dashboard.

      Engagement Overview:
      - Average Clicks: ${avgClicks.toFixed(1)}
      - Average Engagement Time: ${formatSeconds(avgEngagingTime)}
      - Average Replies: ${avgReplies.toFixed(1)}

      Generate 5 specific, actionable recommendations to improve overall engagement metrics.
      Focus on:
      - Content strategy adjustments
      - Timing optimization
      - User re-engagement tactics
      - Personalization opportunities

      Format each recommendation as a separate bullet point with a brief explanation.
      Use markdown formatting with **bold** for key actions.
    `;

        // Log the prompt being sent to the AI
        console.log("Prompt being sent to AI: ", prompt);

        // AI model input
        const input = {
            modelId: "amazon.titan-text-express-v1",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                inputText: prompt,
                textGenerationConfig: {
                    maxTokenCount: 1500,
                    temperature: 0.7,
                    topP: 0.9
                }
            })
        };

        // Log the input object
        console.log("Input to AI model: ", input);

        const command = new InvokeModelCommand(input);
        const response = await titanClient.send(command);

        // Log the raw AI response
        console.log("AI Response: ", response);

        const result = JSON.parse(Buffer.from(response.body).toString());

        // Log the parsed result
        console.log("Parsed AI Response: ", result);

        // Check if the result has the expected structure
        if (!result.results || result.results.length === 0 || !result.results[0].outputText) {
            console.error("AI response is missing or malformed", result);
            throw new Error("AI response is missing or malformed");
        }

        // Parse the AI result into recommendations
        const recommendations = result.results[0].outputText
            .split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map(rec => ({
                id: crypto.randomUUID(),
                text: rec.replace(/^[-*]/, '').trim(),
                generatedAt: new Date().toISOString()
            }));

        return recommendations;
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        throw new Error("Failed to generate recommendations");
    }
}




/**
 * Helper function to format time from seconds to a readable string.
 */
function formatSeconds(seconds) {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins > 0 ? mins + 'm ' : ''}${secs}s`;
}

export default {
    generateAdminRecommendations
};
