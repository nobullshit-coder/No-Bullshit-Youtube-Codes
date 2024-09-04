require('dotenv').config();
const { program } = require('commander');
const { v4: uuidv4 } = require('uuid');
const fse = require('fs-extra');
// const config = require('./config.js');
const {generateFactsForShorts, generateAudio} = require("./lib/open-ai");
const path = require("node:path");
const pexels = require("./lib/pexels");
const transcribeAudio = require("./lib/aws");
const captions = require("./lib/caption");
const {getMediaDuration, generateVideo} = require("./lib/ffmpeg-helpers");

program
    .option('-t, --topic <topic>', "Topic for video", "science facts")
    .option('-n, --num <num>', 'Number of shorts to generate', '3')
    .option('-o, --output <output>', 'Output directory', 'output');

program.parse(process.argv);

const options = program.opts();

const topic = options.topic;
const num = options.num;
const output = options.output;

console.log(`Program started with args: topic: ${topic}, num: ${num}, output: ${output}`);

(async () => {
    try {
        const uid = uuidv4(); // random string
        // const uid = "2da91e97-b1c2-44a6-bd20-e66637fb5b58"; // for debugging
        const output_dir = path.join(__dirname, output, uid);
        await fse.ensureDir(output_dir);

        console.log('script started ......... ');
        // Step 1 - generate topic content from OpenAI - ChatGPT
        const facts = await generateFactsForShorts(topic, num);
        console.log('facts: ', facts);

        let i = 1;
        for (const fact of facts) {
            // Step 2 - generate audio for the content
            const tts_file_path = path.join(output_dir, `audio_${i}.mp3`);
            await generateAudio(fact.content, tts_file_path);
            console.log(`${i}: audio generated ....`);

            // Step 3 - Download a stock footage form pexels
            const stock_footage_path = path.join(output_dir, `stock_${i}.mp4`);
            await pexels(fact.pexels, stock_footage_path);
            console.log(`${i}: stock video downloaded ....`);

            // Step 4 - transcribe the audio for captions
            const transcription_path = path.join(output_dir, `transcription_${i}.json`);
            await transcribeAudio(tts_file_path, transcription_path);
            console.log(`${i}: transcription generated ....`);

            // Step 5 - generate captions
            const initial_speech_delay = 0.5; // in seconds
            const end_speech_delay = 0.5; // in seconds
            const caption_path = path.join(output_dir, `caption_${i}.ass`);
            await captions(transcription_path, caption_path, {
                audio_delay: initial_speech_delay,
                font_size: 24
            });

            const audio_duration = await getMediaDuration(tts_file_path);

            let video_duration = initial_speech_delay + audio_duration + end_speech_delay;
            if (video_duration > 59) {
                video_duration = 59;
            }

            console.log('video duration: ', video_duration);

            // Step 6 - combine all to create a video
            const video_output_path = path.join(output_dir, `video_${i}.mp4`);
            await generateVideo(output_dir, i, video_output_path, {
                duration: video_duration,
                audio_delay: initial_speech_delay
            });

            console.log(`everything finished for step ${i} ....\n\n`);
            i++;
        }

        console.log('script ended ......... ');
    } catch (e) {
        console.log('e: ', e);
    }
})();