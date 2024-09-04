# Youtube Shorts Automation

## Before you start
Make sure you have `ffmpeg` installed and available in your path.
You can download from `https://www.ffmpeg.org/download.html`.

Run `ffmpeg` command on your system and it should run just fine.

## Installation
1. Create a new file `.env` in `youtube-shorts-automation` directory
2. Copy the content of `.env.example` -> `.env`
3. Update all API keys mentioned in `.env.example`

Run `npm install` in `youtube-shorts-automation` directory to install dependencies.

## How to Run
Inside `youtube-shorts-automation` directory, run 
```bash
node index.js --help

Usage: index [options]

Options:
  -t, --topic <topic>    Topic for video (default: "science facts")
  -n, --num <num>        Number of shorts to generate (default: "3")
  -o, --output <output>  Output directory (default: "output")
  -h, --help             display help for command
```

Example: 
```bash

node index.js -t "Funny knock knock jokes" -n 3

```

# Next Step

1. Add a background music
2. randomise the TTS voices

# Next in this session

1. How to break long videos into clips and then create shorts out of that
  - Break the clips into smaller chunks
  - we will resize them to fit the vertical format
  - transcribe and caption

2. We can use AI to center the speaker

3. We can also use youtube data api to upload the video directly to youtube
4. We can also use youtube heatmap to figure out what was trending topic and auto creat clips out of it

possibilities are endless

we will discuss all these in next few videos

Thank you for watching

please Like, Share and Subscribe