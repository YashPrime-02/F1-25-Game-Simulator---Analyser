// src/services/aiService.js
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

exports.generateAIText = async (prompt) => {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    });

    return response.data.response;
  } catch (error) {
    console.error('AI Error:', error.message);
    throw new Error('AI generation failed');
  }
};