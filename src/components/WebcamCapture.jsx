import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { uploadData } from 'aws-amplify/storage'; // Importar la función para subir datos a S3
import './Webcam.css'


const WebcamCapture = () => {
  const [photo, setPhoto] = useState(null); // Para guardar la imagen tomada
  const [loading, setLoading] = useState(false); // Para saber si se está subiendo la foto
  const [uploadProgress, setUploadProgress] = useState(0); // Progreso de la subida
  const webcamRef = useRef(null); // Referencia al componente Webcam

  // Función para capturar la foto
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc); // Guardar la imagen tomada
    sendImage(imageSrc); // Enviar la imagen en base64 a la API
  };

  // Función para convertir la imagen base64 a Blob (esto es necesario para la subida a S3)
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

  // Función para enviar la imagen en base64 a la API para su procesamiento
  const sendImage = async (imageSrc) => {
    try {
      const file = dataURItoBlob(imageSrc)
       const fileName = `webcam-${Date.now()}.jpg`;
      console.log('que')
      const result = await uploadData({
        path:  `public/${fileName}`,
        data: file, // Ruta del endpoint que procesará la imagen
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              setUploadProgress(progress);
            }
          },
        },
      }).result;
    console.log('holas')
      console.log(result)
      return result.path;
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Captura de Foto</h2>

      {/* Webcam que muestra la vista previa */}
      <Webcam
        audio={false} // Desactivar el audio
        ref={webcamRef}
        screenshotFormat="image/png" // Formato de imagen que queremos
        width="100%" // Ancho del componente Webcam
        videoConstraints={{
          facingMode: 'user', // Utilizar la cámara frontal
        }}
      />

     
      <button className='tomarFotoBtn' onClick={capture}>Tomar Foto</button>


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