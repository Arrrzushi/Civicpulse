import { openai, isOpenAIAvailable } from "./openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024

export async function validateLegalComplaint(title: string, description: string, category: string): Promise<{
  isValid: boolean;
  reason?: string;
  analysis?: string;
  suggestedUrgency?: string;
  suggestedPrivacy?: string;
}> {
  // If OpenAI is not available, return a default response
  if (!isOpenAIAvailable()) {
    console.log('OpenAI validation skipped - API key not available');
    return {
      isValid: true,
      reason: "Validation skipped - Development mode",
      analysis: "No analysis available in development mode",
      suggestedUrgency: "medium",
      suggestedPrivacy: "public"
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a legal complaint validator and advisor. Analyze the complaint and provide:
1. Validity assessment
2. Detailed analysis
3. Suggested urgency level (high/medium/low)
4. Suggested privacy setting (private/public/legal)
5. Brief reason for your assessment

Respond with JSON containing all these fields.`
        },
        {
          role: "user",
          content: `Please analyze this complaint:
            Title: ${title}
            Category: ${category}
            Description: ${description}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      isValid: result.isValid,
      reason: result.reason,
      analysis: result.analysis,
      suggestedUrgency: result.suggestedUrgency,
      suggestedPrivacy: result.suggestedPrivacy
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: true, // Default to true if validation fails
      reason: "Validation service unavailable"
    };
  }
}