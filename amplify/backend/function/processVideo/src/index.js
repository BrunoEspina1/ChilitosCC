const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();

exports.handler = async (event) => {
  // key y bucket pueden venir de un trigger S3 o del cuerpo HTTP
  const bucket = event.bucket;
  const key    = event.key;

  const params = {
    Video: { S3Object: { Bucket: bucket, Name: key } },
    NotificationChannel: {
      RoleArn:  'arn:aws:iam::954976296009:role/RekVideoRole',
      SNSTopicArn: 'arn:aws:sns:us-east-1:954976296009:RekognitionJobs'
    }
  };
  const { JobId } = await rek.startTextDetection(params).promise();
  console.log('Job lanzado:', JobId);

  return { statusCode: 202, body: JSON.stringify({ jobId: JobId }) };
};
