const { HfInference } = require('@huggingface/inference');
const dotenv = require('dotenv');

dotenv.config();

const hf = new HfInference(process.env.HF_API_KEY);

class llmcontroller {
  static async getHuggingFaceChatResponse(req, res) {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      let prompt = `<|system|>You are a personalized news aggregator assistant. `;
      if (context && context.username) {
        prompt += `The user is ${context.username}. `;
      }
      prompt += `Assist with news-related queries, provide article recommendations, summarize news, or help manage bookmarks based on user preferences. Answer concisely and naturally, and only respond to the user's exact input without assuming additional questions.<|user|>${message}<|assistant|>`;

      console.log('Prompt:', prompt);

      const response = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      });

      let assistantResponse = response.generated_text.trim();
      if (!assistantResponse) {
        assistantResponse = "I couldn't generate a proper response.";
      }

      res.json({
        response: assistantResponse,
        source: 'huggingface',
      });
    } catch (error) {
      console.error('Hugging Face Error:', error.message);
      res.status(500).json({ error: 'Failed to get response from Hugging Face' });
    }
  }

  static async getChatResponse(req, res) {
    try {
      await llmcontroller.getHuggingFaceChatResponse(req, res);
    } catch (error) {
      console.error('Chat Response Error:', error.message);
      res.status(500).json({ error: 'Failed to get chat response' });
    }
  }
}

module.exports = { llmcontroller };