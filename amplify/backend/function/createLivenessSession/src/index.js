const { RekognitionClient, CreateFaceLivenessSessionCommand } = require('@aws-sdk/client-rekognition');


const rekog = new RekognitionClient({});

export const handler = async () => {
  try {
    const { SessionId } = await rekog.send(
      new CreateFaceLivenessSessionCommand({})
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: SessionId,
        region: 'us-east-1'
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "error" }) };
  }
};
