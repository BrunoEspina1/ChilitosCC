import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { uploadData, downloadData } from 'aws-amplify/storage';
import { post } from 'aws-amplify/api';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import './WebcamVideo.css';
import { BsRecordCircleFill } from "react-icons/bs";
import { FaStop } from "react-icons/fa";

const WebcamVideo = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [plates, setPlates] = useState([]);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        await ffmpegRef.current.load();
      } catch (err) {
        setError('Error al cargar el conversor de video');
      }
    };
    loadFFmpeg();
  }, []);

  const convertVideoToH264 = async (webmBlob) => {
    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input.webm';
      const outputName = 'output.mp4';
      
      await ffmpeg.writeFile(inputName, await fetchFile(webmBlob));
      
      await ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-movflags', 'frag_keyframe+empty_moov',
        outputName
      ]);
      
      const data = await ffmpeg.readFile(outputName);
      return new Blob([data], { type: 'video/mp4' });
    } catch (err) {
      setError('Error en la conversión del video');
      throw err;
    }
  };

  const startRecording = () => {
    try {
      const videoStream = webcamRef.current.stream;
      const mimeType = 'video/mp4; codecs=avc1';
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        alert('Tu navegador no soporta H.264/MP4. El video será convertido');
      }

      mediaRecorderRef.current = new MediaRecorder(videoStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm'
      });

      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          let videoBlob = new Blob(chunks, { type: mediaRecorderRef.current.mimeType });
          
          if (!mediaRecorderRef.current.mimeType.includes('mp4')) {
            videoBlob = await convertVideoToH264(videoBlob);
          }
          
          const videoUrl = URL.createObjectURL(videoBlob);
          setVideo(videoUrl);
          await sendVideo(videoBlob);
        } catch (err) {
          setError('Error procesando la grabación');
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Error al iniciar la grabación');
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } catch (err) {
      setError('Error al detener la grabación');
    }
  };

  const sendVideo = async (videoBlob) => {
    try {
      setError(null);
      setPlates([]);
      const fileName = `webcam-video-${Date.now()}.mp4`;
      setLoading(true);
      
      await uploadData({
        path: `public/${fileName}`,
        data: videoBlob,
        options: {
          contentType: 'video/mp4',
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              setUploadProgress(Math.round((transferredBytes / totalBytes) * 100));
            }
          },
        },
      }).result;

      const jobId = await analyzeVideo(fileName);
      await fetchResultsWithRetry(jobId);
    } catch (err) {
      setError('Error subiendo el video');
      setLoading(false);
    }
  };

  const analyzeVideo = async (fileKey) => {
    try {
      const res = await post({
        apiName: 'CCApi',
        path: '/video/process',
        options: {
          body: {
            bucket: 'chilitosccb57f042b6f394b9c86efe0bb3430ab2757ab7-dev',
            key: `public/${fileKey}`,
          },
        },
      });

      const { body } = await res.response;
      const response = await body.json();
      return response.jobId;
    } catch (err) {
      setError('Error iniciando análisis de video');
      throw err;
    }
  };

  const fetchResultsWithRetry = async (jobId, retries = 3, delay = 45000) => {
    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      const result = await downloadData({
        path: `public/${jobId}-plates.json`
      }).result;
      
      console.log('Cargando..')
      const text = await result.body.text();
      const data = JSON.parse(text);
      setPlates(data.uniquePlates || []);
      setLoading(false);
      
    } catch (err) {
      if (retries > 0) {
        await fetchResultsWithRetry(jobId, retries - 1, delay);
      } else {
        setError('No se pudieron obtener los resultados');
        setLoading(false);
      }
    }
  };

  return (
    <div className="video-container">
      <h2>Captura de Video</h2>
      
      <Webcam
        audio={false}
        ref={webcamRef}
        videoConstraints={{
          facingMode: 'user',
          width: 1280,
          height: 720
        }}
        className="webcam-preview"
      />

      <div className="controls">
        <button 
          onClick={startRecording} 
          disabled={isRecording}
          className={`record-btn ${isRecording ? 'disabled' : ''}`}
        >
          <BsRecordCircleFill /> Iniciar Grabación
        </button>
        
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`stop-btn ${!isRecording ? 'disabled' : ''}`}
        >
          <FaStop /> Detener Grabación
        </button>
      </div>

      {isRecording && (
        <div className="recording-indicator">
          ● Grabando...
        </div>
      )}

      {video && (
        <div className="video-preview">
          <h3>Vista previa</h3>
          <video controls src={video} width="100%" />
        </div>
      )}

      {loading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${uploadProgress}%` }} />
          <div className="progress-text">{uploadProgress}%</div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {plates.length > 0 && (
        <div className="results-container">
          <h3>Placas detectadas:</h3>
          <ul>
            {plates.map((plate, index) => (
              <li key={index}>{plate}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WebcamVideo;