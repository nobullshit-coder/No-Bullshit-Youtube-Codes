const { ElevenLabsClient } = require("elevenlabs");
const fs = require("node:fs");

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY // Defaults to process.env.ELEVENLABS_API_KEY
})

async function generateAudio(text, output){
    return new Promise(async (resolve, reject) => {
        const audio = await elevenlabs.generate({
            voice: "pqHfZKP75CvOlQylNhV4",
            text,
            model_id: "eleven_multilingual_v2"
        });

        const fileStream = fs.createWriteStream(output);
        audio.pipe(fileStream);

        fileStream.on("finish", () => resolve(output));
        fileStream.on("error", reject);
    });
}

module.exports = {
    generateAudio
}