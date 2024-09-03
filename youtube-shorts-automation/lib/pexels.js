const axios = require('axios');
const fs = require('node:fs');
const fetch = require("../utils/mod.cjs");

async function pexels(query, output) {
    const response = await axios.get(`https://api.pexels.com/videos/search?query=${query}&orientation=portrait&size=medium&per_page=1`, {
        headers: {
            "Authorization": `${process.env.PEXELS_API_KEY}`,
        }
    });

    const videoRes = response.data.videos[0].video_files[0];
    const videoStream = await fetch(videoRes.link);
    const videoBuffer = await videoStream.arrayBuffer();
    fs.writeFileSync(output, Buffer.from(videoBuffer));

    return output;
}

module.exports = pexels;