const { RekognitionClient, GetFaceLivenessSessionResultsCommand } = require('@aws-sdk/client-rekognition');

const rekog = new RekognitionClient({});
const THRESHOLD = 0.95;               

export const handler = async (event) => {
  const sessionId = event.queryStringParameters?.sessionId;
  if (!sessionId) {
    return { statusCode: 400, body: "Missing sessionId" };
  }

  try {
    const { Confidence } = await rekog.send(
      new GetFaceLivenessSessionResultsCommand({ SessionId: sessionId })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        confidence: Confidence,
        isLive: Confidence >= THRESHOLD,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "error" };
  }
};
