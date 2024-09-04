const { exec, execSync } = require("child_process");

async function getMediaDuration(file_path) {
    return new Promise((resolve, reject) => {
        exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file_path}"`, (err, stdout) => {
            if (err) {
                reject(err);
            }
            resolve(parseInt(stdout.trim(), 10));
        })
    })
}

async function generateVideo(output_dir, i, output, {
    duration,
    audio_delay
}) {
    const stock_video = `stock_${i}.mp4`;
    const tts_audio = `audio_${i}.mp3`;
    const caption = `caption_${i}.ass`;

    // flags
    const flags = [
        "-c:v libx264",
        "-c:a aac",
        "-strict experimental",
        "-b:a 192k",
        "-shortest",
        `-t ${duration}`,
        `-af "adelay=${audio_delay * 1000}|${audio_delay * 1000}"`
    ];

    // video filters
    const vf = `-vf "ass=${caption}"`

    const command = `ffmpeg -stream_loop -1 -i ${stock_video} -i ${tts_audio} ${vf} ${flags.join(" ")} ${output}`;
    execSync(command, { stdio: 'inherit', cwd: output_dir });
    console.log('video generated .... ');
}

module.exports = {
    getMediaDuration, generateVideo
}