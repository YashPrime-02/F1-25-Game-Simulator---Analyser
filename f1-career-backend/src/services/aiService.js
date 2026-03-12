const axios = require("axios");

const AI_URL = process.env.AI_BASE_URL;
const MODEL = process.env.AI_MODEL;

exports.generateAIText = async (prompt) => {
  try {
    const res = await axios.post(AI_URL, {
      model: MODEL,
      prompt,
      stream: false,
    });

    return res.data.response;
  } catch (err) {
    console.error("AI Error:", err.message);
    throw new Error("AI generation failed");
  }
};