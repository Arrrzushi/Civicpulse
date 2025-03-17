import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI();

export async function validateLegalComplaint(title: string, description: string, category: string): Promise<{
  isValid: boolean;
  reason?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a legal complaint validator. Analyze the complaint and determine if it's a valid legal grievance. Respond with JSON containing isValid (boolean) and reason (string)."
        },
        {
          role: "user",
          content: `Please validate this legal complaint:
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
      reason: result.reason
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: true, // Default to true if validation fails
      reason: "Validation service unavailable"
    };
  }
}
