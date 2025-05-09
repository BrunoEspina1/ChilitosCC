import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { uploadData } from 'aws-amplify/storage'; // Importar la función para subir datos a S3
import './Webcam.css'
import { post } from 'aws-amplify/api';
import './Liveness.css'
import { IoCameraOutline } from "react-icons/io5";


const WebcamCapture = ( {estadoDeseado, setPassed}) => {
  const [photo, setPhoto] = useState(null); // Para guardar la imagen tomada
  const [loading, setLoading] = useState(false); // Para saber si se está subiendo la foto
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const webcamRef = useRef(null); // Referencia al componente Webcam
  const [overlayActive, setOverlayActive] = useState(false);
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

    const handleButtonClick = () => {
  
    setPassed(true); 
  };

  // Función para enviar la imagen en base64 a la API para su procesamiento
  const sendImage = async (imageSrc) => {
    try {
      const file = dataURItoBlob(imageSrc)
       const fileName = `webcam-${Date.now()}.jpg`;
      console.log('enviando foto')
      const result = await uploadData({
        path:  `public/${fileName}`,
        data: file,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              setUploadProgress(progress);
            }
          },
        },
      }).result;
    
      console.log('Imagen cargada', result.path)
      handleUpload(result.path)
      return result.path;

    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      throw error;
    }
  };


  const compararEstado = (resultadoAWS, estadoDeseado) => {
    const emociones = resultadoAWS.faces[0].emotions.reduce((acc, emo) => {
      acc[emo.Type.toLowerCase()] = emo.Confidence > 90; // Puedes ajustar el umbral
      return acc;
    }, {});

  

    const resultado = {
      sonrie: resultadoAWS.faces[0].smile?.Value === true,
      boca_abierta: resultadoAWS.faces[0].mouthOpen?.Value === true,
      ojos_abiertos: resultadoAWS.faces[0].eyesOpen?.Value === true,
    
      feliz: emociones['happy'] || false,
      sorprendido: emociones['surprised'] || false,
      calmado: emociones['calm'] || false,
      confundido: emociones['confused'] || false,
      disgustado: emociones['disgusted'] || false,
      triste: emociones['sad'] || false,
      miedo: emociones['fear'] || false,
      enojado: emociones['angry'] || false,
    
      sonriente: resultadoAWS.faces[0].smile?.Value === true,
      abre_la_boca: resultadoAWS.faces[0].mouthOpen?.Value === true,
      ojos_abiertos_completamente: resultadoAWS.faces[0].eyesOpen?.Value === true,
    
      riendo: emociones['happy'] || false,
      asombrado: emociones['surprised'] || false,
      relajado: emociones['calm'] || false,
      confundida: emociones['confused'] || false,
      molesto: emociones['angry'] || false,
      frunce_el_ceño: emociones['angry'] || false,
      desagrado: emociones['disgusted'] || false,
      llorando: emociones['sad'] || false,
      nervioso: emociones['fear'] || false,
      temeroso: emociones['fear'] || false,
    };
  
    return resultado[estadoDeseado] === true;
  };
  
  
  // Función para manejar la carga de la imagen y enviar la solicitud a la API Gateway
  const handleUpload = async (path) => {

    setLoading(true);
    setStatusMessage('');
    setOverlayActive(true); 

    try {
      // Subir la imagen a S3 y obtener la clave del archivo
      const fileKey = await path

      console.log('analizando...')
      const result = post({
        apiName: 'CCApi',
        path: '/facial-analysis',
        options: {
          body: {
            bucket: 'chilitosccb57f042b6f394b9c86efe0bb3430ab2757ab7-dev', 
            key: fileKey,
          },
        },
      });
     
      const { body } = await result.response;
      const response = await body.json();
      console.log('Respuesta del analizador: ', response);
      const coincide = compararEstado(response, estadoDeseado);
      console.log('Coincidencia: ', coincide)
      
      if (coincide) {
        setStatusMessage(`✅ La persona coincide con el estado: ${estadoDeseado}`);
        setSuccess(true);
      } else {
        setStatusMessage(`❌ No coincide con el estado: ${estadoDeseado}`);
        setSuccess(false);
      }
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      setStatusMessage('Ocurrió un error al procesar la imagen.');
    } finally {
      setLoading(false);
     
      setTimeout(() => {
        setOverlayActive(false); 
      }, 2000);
    }
  };

  return (
    <div>
        <div className=''>
         <h2>AUTENTICADOR DE GESTOS</h2>
         </div> 
       {overlayActive && (
        <div className={`overlay ${statusMessage ? 'active' : ''}`}>
          <div className="overlay-content">
            <p className={success ? 'success' : 'error'}>{statusMessage}</p>
          </div>
        </div>
      )}
      <div className='pageDiv'>
      {success && <button onClick={handleButtonClick} className='pageButton'>Ir a plates</button>}
      </div>
      
      <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/png"
      width="120%"
      videoConstraints={{
        facingMode: 'user',
      }}
      style={{
        backgroundColor: 'white',
          border: success === null ? 'none' : success ? '3px solid green' : '',
          display: 'flex',
          alignItems: 'center',
          flex: 'auto',
          borderRadius: '20px',
  }}
/>

     
      <button className='tomarFotoBtn' onClick={capture}><IoCameraOutline /></button> 


      {loading && (
        <div>
          <p>Subiendo la imagen... {uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;