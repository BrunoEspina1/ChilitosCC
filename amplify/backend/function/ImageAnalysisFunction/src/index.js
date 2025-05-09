// Load the AWS SDK
import AWS from 'aws-sdk';
const rekognition = new AWS.Rekognition();

export const handler = async (event) => {
    const eventBody = JSON.parse(event.body);
    const bucket = eventBody.bucket;
    const key = eventBody.key;

    // Parámetros para el análisis facial
    const params = {
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: key,
            },
        },
        Attributes: ['ALL'],  // Esto devuelve todos los atributos disponibles
    };

    try {
        // Llamada a detectFaces con el SDK v2
        rekognition.detectFaces(params, (err, response) => {
            if (err) {
                console.error('Error:', err);  // Si ocurrió un error
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    },
                    body: JSON.stringify({ message: err.message }),
                };
            } else {
                console.log(`Detected faces for: ${key}`);

                // Creamos un array para almacenar los resultados
                const facesData = response.FaceDetails.map((data) => ({
                    ageRange: {
                        low: data.AgeRange.Low,
                        high: data.AgeRange.High,
                    },
                    boundingBox: data.BoundingBox,
                    smile: data.Smile,
                    eyeglasses: data.Eyeglasses,
                    sunglasses: data.Sunglasses,
                    gender: data.Gender,
                    beard: data.Beard,
                    mustache: data.Mustache,
                    eyesOpen: data.EyesOpen,
                    mouthOpen: data.MouthOpen,
                    emotions: data.Emotions,
                    landmarks: data.Landmarks,
                    pose: data.Pose,
                    quality: data.Quality,
                    confidence: data.Confidence,
                }));

                // Devolvemos los resultados como objeto/array
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    },
                    body: JSON.stringify({
                        message: 'Análisis facial realizado con éxito',
                        faces: facesData,
                    }),
                };
            }
        });
    } catch (error) {
        console.error('Error en el procesamiento:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            },
            body: JSON.stringify({ message: error.message }),
        };
    }
};
