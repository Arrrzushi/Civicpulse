import OpenAI from 'openai';

// Check if API key is available
const apiKey = process.env.OPENAI_API_KEY || 'dummy-key';

// Create OpenAI instance with fallback for development
export const openai = new OpenAI({
  apiKey: apiKey
});

// Add a function to check if OpenAI can be used
export const isOpenAIAvailable = () => {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
};
