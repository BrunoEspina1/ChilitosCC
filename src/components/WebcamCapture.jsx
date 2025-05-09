import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { uploadData } from 'aws-amplify/storage'; // Importar la función para subir datos a S3
import { post } from 'aws-amplify/api'; // Importar la función para hacer el POST a la API

const WebcamCapture = () => {
  const [photo, setPhoto] = useState(null); // Para guardar la imagen tomada
  const [loading, setLoading] = useState(false); // Para saber si se está subiendo la foto
  const [uploadProgress, setUploadProgress] = useState(0); // Progreso de la subida
  const webcamRef = useRef(null); // Referencia al componente Webcam

  // Función para capturar la foto
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc); // Guardar la imagen tomada
    uploadImageToS3(imageSrc); // Subir la imagen a S3
  };

  // Función para convertir la imagen base64 a Blob
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: mimeString });
  };

  // Función para subir la imagen a S3
  const uploadImageToS3 = async (imageSrc) => {
    const file = dataURItoBlob(imageSrc); // Convertir base64 a Blob
    const fileName = `webcam-${Date.now()}.jpg`; // Nombre único para el archivo

    setLoading(true); // Indicar que la carga ha comenzado

    try {
      // Subir la imagen a S3
      const result = await uploadData(fileName, file, {
        contentType: 'image/jpeg', // Tipo de contenido
        progressCallback(progress) {
          // Actualizar el progreso de la carga
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });

      console.log('Imagen subida a S3: ', result);
      alert('Imagen subida con éxito');

      // Enviar la URL del archivo a la API para su procesamiento
      sendImageToApi(result.key);
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      alert('Hubo un error al subir la imagen.');
    } finally {
      setLoading(false); // Finalizar el proceso de carga
    }
  };

  // Función para enviar la URL de la imagen a la API para su procesamiento
  const sendImageToApi = async (fileKey) => {
    try {
      const result = await post({
        apiName: 'CCApi', // El nombre de la API en Amplify
        path: '/facial-analysis', // Ruta del endpoint que procesará la imagen
        options: {
          body: {
            bucket: 'chilitosccb57f042b6f394b9c86efe0bb3430ab2757ab7-dev', // Tu nombre de bucket de S3
            key: fileKey, // El key del archivo en S3
          },
        },
      });

      const { body } = await result.response;
      const response = await body.json();
      console.log(response);
      alert('Análisis facial completado');
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Ocurrió un error al procesar la imagen.');
    }
  };

  return (
    <div>
      <h2>Captura de Foto</h2>

      {/* Webcam que muestra la vista previa */}
      <Webcam
        audio={false} // Desactivar el audio
        ref={webcamRef}
        screenshotFormat="image/jpeg" // Formato de imagen que queremos
        width="100%" // Ancho del componente Webcam
        videoConstraints={{
          facingMode: 'user', // Utilizar la cámara frontal
        }}
      />

      {/* Botón para tomar la foto */}
      <button onClick={capture}>Tomar Foto</button>

      {/* Mostrar la imagen capturada */}
      {photo && (
        <div>
          <h3>Imagen Capturada:</h3>
          <img src={photo} alt="captured" style={{ maxWidth: '100%' }} />
        </div>
      )}

      {/* Mostrar el progreso de la carga */}
      {loading && (
        <div>
          <p>Subiendo la imagen... {uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;

