const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand} = require("@aws-sdk/client-transcribe");
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("node:fs");
const { v4: uuidv4 } = require("uuid");

const aws_region = "us-east-1";

const transcribe = new TranscribeClient({
    region: aws_region,
});

const s3 = new S3Client({
    region: aws_region,
});

async function transcribeAudio(audio_path, output) {
    const uid = uuidv4();
    const job_name = `audio_${uid}`;
    const file_name = `${job_name}.mp3`;

    const bucket_name = "tm-api-data";
    await uploadToS3(audio_path, bucket_name, file_name);
    const s3_file_uri = `s3://${bucket_name}/${file_name}`;

    const params = {
        TranscriptionJobName: job_name,
        LanguageCode: "en-US", // hi-IN
        MediaFormat: "mp3",
        Media: { MediaFileUri: s3_file_uri },
        OutputBucketName: bucket_name
    };

    try {
        const command = new StartTranscriptionJobCommand(params);
        const data = await transcribe.send(command);
        console.log('transcription started ...');

        const transcriptionURI = await waitForTranscription(job_name, bucket_name);
        if (!transcriptionURI) {
            return null;
        }

        const transcriptionJSON = await getTranscriptionResult(job_name, bucket_name);
        fs.writeFileSync(output, JSON.stringify(transcriptionJSON, null, 4));

        // delete the assets from s3 to free some space
        await deleteFile(file_name, bucket_name); // delete the input audio
        await deleteFile(`${job_name}.json`, bucket_name); // delete the output transcription

        return transcriptionJSON;
    } catch (e) {
        console.log('aws transcribe err: ', e);
    }
}

async function deleteFile(key, bucket_name) {
    try {
        const params = {
            Bucket: bucket_name,
            Key: key
        };

        const command = new DeleteObjectCommand(params);
        return s3.send(command);
    } catch (e) {
        console.log('error while deleting: ', e);
    }
}

async function getTranscriptionResult(job_name, bucket_name) {
    const params = {
        Bucket: bucket_name,
        Key: `${job_name}.json`
    };

    const command = new GetObjectCommand(params);
    const { Body } = await s3.send(command);

    const transcriptData = await streamToString(Body);
    return JSON.parse(transcriptData);
}

async function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", chunk => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        stream.on("error", reject);
    })
}

async function waitForTranscription(job_name, bucket_name) {
    const getStatus = async () => {
        const { TranscriptionJob } = await transcribe.send(new GetTranscriptionJobCommand({
            TranscriptionJobName: job_name
        }));
        return TranscriptionJob.TranscriptionJobStatus;
    }

    let attempt = 0;
    while (true) {
        const status = await getStatus();
        if (status === "COMPLETED") {
            const transcriptionURI = `s3://${bucket_name}/${job_name}`;
            console.log('transcription completed');
            return transcriptionURI;
        } else if (status === 'FAILED') {
            throw new Error("Transcription Failed");
        }

        await new Promise(resolve => setTimeout(resolve, 10 * 1000)); // wait for 10 seconds between each retry
        attempt++;

        if (attempt > 50) {
            return null;
        }
    }
}

async function uploadToS3(file_path, bucket_name, file_name, key_prefix = "") {
    const key = `${key_prefix}${file_name}`;

    try {
        const file_stream = fs.createReadStream(file_path);
        const params = {
            Bucket: bucket_name,
            Key: key,
            Body: file_stream,
        };

        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        console.log('file uploaded to s3');
        return data;
    } catch (e) {
        console.log('s3 upload error: ', e);
    }
}

module.exports = transcribeAudio;