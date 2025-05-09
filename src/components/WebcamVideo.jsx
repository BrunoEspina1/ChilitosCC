import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { uploadData } from 'aws-amplify/storage'; // Importar la función para subir datos a S3
import './WebcamVideo.css';
import { BsRecordCircleFill } from "react-icons/bs";
import { FaStop } from "react-icons/fa";
import { post } from 'aws-amplify/api';

const WebcamVideo = () => {
  const [video, setVideo] = useState(null); // Para guardar el video grabado
  const [loading, setLoading] = useState(false); // Para saber si se está subiendo el video
  const [uploadProgress, setUploadProgress] = useState(0); // Progreso de la subida
  const [isRecording, setIsRecording] = useState(false); // Estado para saber si está grabando
  const [path, setPath] = useState(false);
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
      const videoBlob = new Blob(chunks, { type: 'video/MP4;codecs=h264' });
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
    setIsRecording(false);
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
      setLoading(false);
      setPath(fileName);
      analyzeVideo();
    } catch (error) {
      console.error('Error al cargar el video:', error);
      setLoading(false);
    }
  };

  const analyzeVideo = async () => {
    try{
      const fileKey = 'public/' + path;
      console.log('filekey del video subido: ', fileKey);

      const res = post({
        apiName: 'CCApi',
        path: '/video/process',
        options: {
          body: {
            bucket: 'chilitosccb57f042b6f394b9c86efe0bb3430ab2757ab7-dev', 
            key: fileKey,
          },
        },
      });

      const { body } = await res.response;
      const response = await body.json();
      console.log(response);
    }
    catch(error){
      console.error('Error al analizar el video: ', error);
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Captura de Video</h2>

      {/* Webcam que muestra la vista previa */}
      <Webcam
        audio={false} // Habilitar el audio
        ref={webcamRef}
        screenshotFormat="image/png" // Formato de imagen para la captura de fotogramas
        videoConstraints={{
          facingMode: 'user', // Utilizar la cámara frontal
        }}
      />

      {/* Botones para iniciar y detener la grabación */}
      <button className='tomarFotoBtn' onClick={startRecording} disabled={isRecording}>
        <BsRecordCircleFill /><p>Iniciar Grabación</p>
      </button>
      <button className='tomarFotoBtn' onClick={stopRecording} disabled={!isRecording}>
            <FaStop /><p>Detener Grabación</p>
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

export default WebcamVideo;

