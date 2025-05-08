const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

exports.handler = async (event) => {
    const bucket = event.bucket;
    const key = event.key;

    
    const params = {
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: key,
            },
        },
    };

    try {
        const data = await rekognition.detectFaces(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Análisis facial realizado con éxito',
                faces: data.FaceDetails,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};
