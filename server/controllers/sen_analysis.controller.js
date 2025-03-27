const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient("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");

const analyzeSentiment = async (text) => {
    try {
        const output = await client.textClassification({
            model: "cardiffnlp/twitter-roberta-base-sentiment",
            inputs: text,
            provider: "hf-inference",
        });

        const sentimentMap = {
            "LABEL_2": "Positive",
            "LABEL_1": "Neutral",
            "LABEL_0": "Negative",
        };

        const finalSentiment = sentimentMap[output.reduce((max, item) => 
            item.score > max.score ? item : max).label];

        return finalSentiment; // Only return "Positive", "Neutral", or "Negative"
    } catch (error) {
        console.error("Error analyzing sentiment:", error.message);
        throw error;
    }
};

module.exports = { analyzeSentiment };
