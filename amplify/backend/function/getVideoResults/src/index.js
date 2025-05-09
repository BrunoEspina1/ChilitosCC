const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();

exports.handler = async (event) => {
  const message = JSON.parse(event.Records[0].Sns.Message);
  const jobId = message.JobId;

  let paginationToken;
  let plates = [];

  do {
    const res = await rek.getTextDetection({
      JobId: jobId,
      NextToken: paginationToken
    }).promise();

    // Filtra líneas que parezcan matrícula
    res.TextDetections.forEach(det => {
      if (det.Type === 'LINE' && /^[A-Z0-9\-]{6,8}$/.test(det.DetectedText)) {
        plates.push({
          text: det.DetectedText,
          time: det.Timestamp,
          confidence: det.Confidence,
          bbox: det.Geometry.BoundingBox
        });
      }
    });
    paginationToken = res.NextToken;
  } while (paginationToken);

  console.log('Placas encontradas:', plates);
  // Guardar en DynamoDB, S3, o devolver por API
};
