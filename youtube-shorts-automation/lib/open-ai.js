const OpenAi = require('openai');
const fs = require("node:fs");

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateFactsForShorts(topic, num) {
    try {
        const prompt = `generate a JSON array with ${num} objects related to the topic "${topic}".
Each topic should include:
1. "title": A catchy title for youtube shorts with emojis, under 100 words.
2. "description": A description for youtube, including trending hashtags
3. "tags": Comma-seperated trending tags
4. "pexels": a search query for Pexels API to fetch the related videos.
5. "content": Facts or content related to the topic. Ensure the content length is suitable for generating audio that is around 200 words.
`;

        const response = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        return JSON.parse(response.choices[0].message.content.trim());
    } catch (e) {
        console.log('err openai : ', e)
    }
}

async function generateAudio(txt, speechFile) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: txt,
    });
    console.log(speechFile);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
}

module.exports = {
    generateFactsForShorts,
    generateAudio
};