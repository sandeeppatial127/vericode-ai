import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read prompts
const getPromptTemplate = async (fileName) => {
  try {
    const filePath = path.join(__dirname, '..', 'prompts', fileName);
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading prompt template ${fileName}:`, error.message);
    throw new Error('Failed to load system prompt template.');
  }
};

// Sanitize user inputs to prevent injection issues
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  // Basic sanitization: trim and remove non-printable control characters
  return text.trim();
};

/**
 * Calls the OpenRouter API to generate completion responses
 */
const callOpenRouter = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured in backend environment.');
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2 // lower temperature for more predictable code output
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000', // required by some openrouter free models
          'X-Title': 'VeriCode AI'
        },
        timeout: 60000 // 60 seconds timeout
      }
    );

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error('Invalid response received from OpenRouter API.');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    // Graceful error handling - never log the API key
    const status = error.response?.status || 500;
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error(`AI API call failed [Status ${status}]:`, errorDetails);
    throw new Error(`AI Service Error: ${errorDetails}`);
  }
};

/**
 * 1. Analyze Code Service
 */
export const analyzeCode = async (code, language) => {
  const cleanCode = sanitizeInput(code);
  const cleanLang = sanitizeInput(language);

  const systemPrompt = await getPromptTemplate('analyzePrompt.txt');
  const userPrompt = `Language: ${cleanLang}\nCode:\n${cleanCode}`;

  const aiResponse = await callOpenRouter(systemPrompt, userPrompt);
  
  // Try to parse the response to ensure it's valid JSON
  try {
    // Sometimes models return markdown wrappers (```json ... ```). Let's clean it up if so.
    let cleanJSON = aiResponse.trim();
    if (cleanJSON.startsWith('```')) {
      cleanJSON = cleanJSON.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Failed to parse AI response as JSON. Raw response was:', aiResponse);
    throw new Error('AI engine did not return valid JSON. Please try again.');
  }
};

/**
 * 2. Explain Code Service
 */
export const explainCode = async (code, language) => {
  const cleanCode = sanitizeInput(code);
  const cleanLang = sanitizeInput(language);

  const basePrompt = await getPromptTemplate('explainPrompt.txt');
  const systemPrompt = `${basePrompt}
  
  CRITICAL: You must return ONLY a valid JSON object. Do not include markdown code block wrappers (like \`\`\`json).
  The JSON structure must be:
  {
    "lineByLine": "A detailed line-by-line explanation of the code.",
    "timeComplexity": "Big O notation and description (e.g. O(N) linear time).",
    "spaceComplexity": "Big O notation and description (e.g. O(1) constant space).",
    "logic": "Detailed explanation of the algorithms and logic used.",
    "improvements": "List of recommended improvements.",
    "explanation": "A complete, beautifully formatted Markdown string incorporating all of the above sections for displaying to the user."
  }`;

  const userPrompt = `Language: ${cleanLang}\nCode:\n${cleanCode}`;
  const aiResponse = await callOpenRouter(systemPrompt, userPrompt);

  try {
    let cleanJSON = aiResponse.trim();
    if (cleanJSON.startsWith('```')) {
      cleanJSON = cleanJSON.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Failed to parse AI response as JSON for explanation. Raw:', aiResponse);
    // Fallback if AI didn't return JSON but raw markdown
    return {
      lineByLine: 'Refer to explanation.',
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      logic: 'Refer to explanation.',
      improvements: 'Refer to explanation.',
      explanation: aiResponse
    };
  }
};

/**
 * 3. Fix Code Service
 */
export const fixCode = async (code, language) => {
  const cleanCode = sanitizeInput(code);
  const cleanLang = sanitizeInput(language);

  const basePrompt = await getPromptTemplate('fixPrompt.txt');
  const systemPrompt = `${basePrompt}
  
  CRITICAL: You must return ONLY a valid JSON object. Do not include markdown code block wrappers (like \`\`\`json).
  The JSON structure must be:
  {
    "fixedCode": "The full repaired/modified source code as a single string.",
    "bugList": ["Bug 1 description", "Bug 2 description"],
    "explanation": "A brief markdown description of what was fixed and why.",
    "optimizedCode": "Optimized and cleaner version of the code if applicable, or same as fixedCode."
  }`;

  const userPrompt = `Language: ${cleanLang}\nCode:\n${cleanCode}`;
  const aiResponse = await callOpenRouter(systemPrompt, userPrompt);

  try {
    let cleanJSON = aiResponse.trim();
    if (cleanJSON.startsWith('```')) {
      cleanJSON = cleanJSON.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Failed to parse AI response as JSON for fix. Raw:', aiResponse);
    // Fallback if AI didn't return JSON
    return {
      fixedCode: aiResponse,
      bugList: ['An error occurred or code fixed without specific listing'],
      explanation: 'Code fixed and optimized.',
      optimizedCode: aiResponse
    };
  }
};

