const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();
const sns = new AWS.SNS();

exports.handler = async (event) => {
  try {
    const eventBody = JSON.parse(event.body);
    const bucket = eventBody.bucket;
    const key = eventBody.key;

    console.log("Bucket:", bucket, "Key:", key);

    // Cambié a startTextDetection para detectar texto (matrículas)
    const params = {
      Video: { S3Object: { Bucket: bucket, Name: key } },
      NotificationChannel: {
        RoleArn: 'arn:aws:iam::954976296009:role/RekVideoRole',
        SNSTopicArn: 'arn:aws:sns:us-east-1:954976296009:ProcessVideos'
      }
    };

    const { JobId } = await rek.startTextDetection(params).promise();
    console.log('Job lanzado:', JobId);

    const snsParams = {
      Message: JSON.stringify({
        JobId: JobId,
        Status: 'SUCCEEDED'
      }),
      TopicArn: 'arn:aws:sns:us-east-1:954976296009:ProcessVideos'
    };

    await sns.publish(snsParams).promise();
    console.log('Mensaje enviado a SNS');

    return { statusCode: 202, body: JSON.stringify({ jobId: JobId }) };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
