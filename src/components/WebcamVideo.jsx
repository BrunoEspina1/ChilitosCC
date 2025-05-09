import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { uploadData } from 'aws-amplify/storage'; // Importar la función para subir datos a S3
import './Webcam.css';

const WebcamVideo = () => {
  const [video, setVideo] = useState(null); // Para guardar el video grabado
  const [loading, setLoading] = useState(false); // Para saber si se está subiendo el video
  const [uploadProgress, setUploadProgress] = useState(0); // Progreso de la subida
  const [isRecording, setIsRecording] = useState(false); // Estado para saber si está grabando
  const webcamRef = useRef(null); // Referencia al componente Webcam
  const mediaRecorderRef = useRef(null); // Referencia al MediaRecorder

  // Función para iniciar la grabación del video
  const startRecording = () => {
    const videoStream = webcamRef.current.stream;
    mediaRecorderRef.current = new MediaRecorder(videoStream);
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const videoBlob = new Blob(chunks, { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setVideo(videoUrl); // Guardar la URL del video grabado
      sendVideo(videoBlob); // Enviar el video a S3
    };

    mediaRecorderRef.current.start();
    setIsRecording(true); // Iniciar la grabación
  };

  // Función para detener la grabación del video
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false); // Detener la grabación
  };

  // Función para convertir el video Blob a un formato compatible con AWS S3
  const sendVideo = async (videoBlob) => {
    try {
      const fileName = `webcam-video-${Date.now()}.mp4`;
      setLoading(true); // Empieza la carga
      await uploadData({
        path: `public/${fileName}`,
        data: videoBlob, // Enviar el video Blob
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              setUploadProgress(progress);
            }
          },
        },
      }).result;
      setLoading(false); // Termina la carga
    } catch (error) {
      console.error('Error al cargar el video:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Captura de Video</h2>

      {/* Webcam que muestra la vista previa */}
      <Webcam
        audio={true} // Habilitar el audio
        ref={webcamRef}
        screenshotFormat="image/png" // Formato de imagen para la captura de fotogramas
        videoConstraints={{
          facingMode: 'user', // Utilizar la cámara frontal
        }}
      />

      {/* Botones para iniciar y detener la grabación */}
      <button className='tomarFotoBtn' onClick={startRecording} disabled={isRecording}>
        Iniciar Grabación
      </button>
      <button className='tomarFotoBtn' onClick={stopRecording} disabled={!isRecording}>
        Detener Grabación
      </button>

      {/* Indicador de grabación */}
      {isRecording && (
        <div style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>
          Grabando...
        </div>
      )}

      {/* Mostrar el video grabado */}
      {video && (
        <div>
          <h3>Video Grabado</h3>
          <video controls src={video} width="100%" />
        </div>
      )}

      {/* Mostrar el progreso de la carga */}
      {loading && (
        <div>
          <p>Subiendo el video... {uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};

export default WebcamVideo;