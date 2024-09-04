const fs = require('fs');
const fsp = require('fs').promises;

async function captions(transcription_file, output, {
    audio_delay = 2,
    font_size = 24
}) {
    const transcript = JSON.parse((await fsp.readFile(transcription_file)).toString());

    let captionTxt = `
[Script Info]
; This is a caption file
Title: Generated Captions
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,${font_size},&H00FFFFFF,&H000000FF,&H64000000,&H32000000,-1,0,0,0,100,100,0,0,1,1.5,1,5,10,10,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text

`;

    const t = transcript.results.items.filter(item => item.type !== "punctuation");
    t.forEach(item => {
        if (item) {
            const txt = item.alternatives[0].content;
            const start_time = formatTime(parseFloat(item.start_time), audio_delay);
            const end_time = formatTime(parseFloat(item.end_time), audio_delay);

            captionTxt += `Dialogue: 0,${start_time},${end_time},Default,,0,0,0,,${txt}\n`;
        }
    });

    fs.writeFileSync(output, captionTxt);
    console.log('caption file saved ... ');
}

function formatTime(seconds, delay) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0');
    const s = parseFloat((seconds % 60) + delay).toFixed(2).padStart(5, '0');
    return `${h}:${m}:${s}`;
}

module.exports = captions;