const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();

exports.handler = async (event) => {
    const message = JSON.parse(event.Records[0].Sns.Message);
    const jobId = message.JobId;

    console.log('SNS message:', message);
    console.log('JobId:', jobId);

    let paginationToken;
    let plates = new Set();  // Usamos Set para evitar duplicados
    let jobStatus = 'IN_PROGRESS';  // Inicializar el estado como IN_PROGRESS

    while (jobStatus === 'IN_PROGRESS') {
        const res = await rek.getTextDetection({
            JobId: jobId,
            NextToken: paginationToken
        }).promise();

        jobStatus = res.JobStatus;  // Obtener el estado del trabajo

        if (jobStatus === 'SUCCEEDED') {
            // Filtrar las líneas que se asemejan a matrículas de vehículos
            res.TextDetections.forEach(det => {
                if (det.TextDetection.Type === 'LINE' && /^[A-Z0-9\-]{6,10}$/.test(det.TextDetection.DetectedText)) {
                    plates.add(det.TextDetection.DetectedText);  // Añadimos al Set, no se permiten duplicados
                }
            });

            // Si no hay más resultados, salir del ciclo
            if (!res.NextToken) {
                break;
            }

            paginationToken = res.NextToken;
        } else if (jobStatus === 'FAILED') {
            console.log('Text detection job failed');
            break;
        }

        // Esperar antes de hacer otra consulta (por ejemplo, 5 segundos)
        await new Promise(resolve => setTimeout(resolve, 5000));  // Espera 5 segundos antes de volver a intentar
    }

    // Convertimos el Set a un array para mostrar las placas encontradas
    const uniquePlates = Array.from(plates);
    console.log('Placas encontradas:', uniquePlates);

    // Aquí puedes guardar las placas en DynamoDB, S3, o devolver por API
};
