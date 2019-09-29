import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as path from 'path';

import S3 from 'aws-sdk/clients/s3';

import TranscribeService from 'aws-sdk/clients/transcribeservice';



let s3 = new S3(creds);

let transcribeservice = new TranscribeService(creds);

const fileName = 'speech.mp3';

function uploadToS3(bucketName: string, keyPrefix: string, filePath: string) {
    var fileName = path.basename(filePath);
    var fileStream = fs.createReadStream(filePath);

    var keyName = path.join(keyPrefix, fileName);

    return new Promise<S3.ManagedUpload.SendData>(function(resolve, reject) {
        fileStream.once('error', reject);
        s3.upload(
            {
                Bucket: bucketName,
                Key: keyName,
                Body: fileStream
            },
            (err: Error, result: S3.ManagedUpload.SendData) => {
                if (err) {
                    console.log("failed to upload");
                    reject(err);
                    return;
                }

                resolve(result);
            }
        );
    });
}

function transcribe(){

    const proc = child_process.spawn("python /Users/ptarsoly/Desktop/twitchcon2k19/audio_rip.py", {shell:true});

    setTimeout(()=>{
        proc.kill();

        var params = {
            TranscriptionJobName: 'twitch_speech' /* required */
          };
          transcribeservice.deleteTranscriptionJob(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
          });

        uploadToS3("twitch-transcribe",fileName,"/Users/ptarsoly/Desktop/twitchcon2k19/speech.mp3").then((result) => {
            console.log('Success! Uploaded ' + fileName + ' to ' + result.Location);

            var params = {
                LanguageCode: "en-US",
                "MediaSampleRateHertz": 48000,
                Media: { /* required */
                  MediaFileUri: "https://twitch-transcribe.s3.amazonaws.com/speech.mp3/speech.mp3"
                },
                TranscriptionJobName: 'twitch_speech', /* required */
                MediaFormat: "mp3",
                OutputBucketName: 'twitch-transcribe'
              };
        
            transcribeservice.startTranscriptionJob(params,function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else{
                    setTimeout(()=>{
                        var params = {
                            Bucket: "twitch-transcribe", 
                            Key: "twitch_speech.json"
                           };
                           s3.getObject(params, function(err, data) {
                            if (err) console.log(err, err.stack); // an error occurred
                            else     console.log(data);           // successful response
                          });
                    }, 30*1000)
                }
              })

        });
    
        
    }, 30*1000)

}

transcribe()
// uploadToS3("twitch-transcribe",'speech',"/Users/ptarsoly/Desktop/twitchcon2k19/speech.mp3").then((result) => {
//     console.log('Success! Uploaded ' + fileName + ' to ' + result.Location);
// });