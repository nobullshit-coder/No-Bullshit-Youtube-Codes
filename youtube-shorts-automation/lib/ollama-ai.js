const { Ollama } = require('ollama');

const ollama = new Ollama({
    host: "http://localhost:11434"
});

async function generateFactsForShorts(topic, num) {
    try {
        const prompt = `generate a JSON array with ${num} objects related to the topic "${topic}".
Each topic should include:
1. "title": A catchy title for youtube shorts with emojis, under 100 words.
2. "description": A description for youtube, including trending hashtags
3. "tags": Comma-seperated trending tags
4. "pexels": a search query for Pexels API to fetch the related videos.
5. "content": Facts or content related to the topic. Ensure the content length is suitable for generating audio that is less than 50 words.
`;

        const res = await ollama.generate({
            prompt,
            model: 'llama3.1',
            stream: false,
            format: 'json',
        });

        const json = JSON.parse(res.response.trim());
        if (json.data) {
            return json.data;
        }
        return json;
    } catch (e) {
        console.log('err ollama : ', e)
    }
}

module.exports = {
    generateFactsForShorts
}