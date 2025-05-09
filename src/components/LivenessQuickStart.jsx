import React, { useState, useEffect } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { post } from 'aws-amplify/api';
import './Liveness.css'


const ImageUpload = ({ onSuccess, setPassed, setAnimationTriggered }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estadoDeseado, setEstadoDeseado] = useState('sonrie'); 
  const [statusMessage, setStatusMessage] = useState('');  
  const [success, setSuccess] = useState(false); 
  const [overlayActive, setOverlayActive] = useState(false);
   
  
  const handleButtonClick = () => {
  
    setPassed(true); 
    setAnimationTriggered(true);  
    onSuccess(); 
  };

 


  const opcionesEstados = [
    "sonrie", 
    "boca_abierta", 
    "ojos_abiertos", 
    "feliz", 
    "sorprendido",
    "calmado", 
    "confundido", 
    "disgustado", 
    "triste", 
    "miedo", 
    "enojado", 
    "sonriente", 
    "abre_la_boca", 
    "ojos_abiertos_completamente", 
    "riendo", 
    "asombrado", 
    "relajado", 
    "confundida", 
    "molesto", 
    "frunce_el_ceño", 
    "desagrado", 
    "llorando", 
    "nervioso", 
    "temeroso"
  ];

  const obtenerEstadoAleatorio = () => {
    const aleatorio = opcionesEstados[Math.floor(Math.random() * opcionesEstados.length)];
    setEstadoDeseado(aleatorio); // Establecer el estado aleatorio seleccionado
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
  
  // Función para manejar el cambio de archivo (imagen seleccionada)
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Función para cargar la imagen y obtener la clave del archivo en S3
  const handleImageUpload = async (file) => {
    try {
        console.log('que')
      const result = await uploadData({
        path: `public/${file.name}`,
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
      console.log('holas')
      console.log(result)
      return result.path;
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      throw error;
    }
  };

  // Función para manejar la carga de la imagen y enviar la solicitud a la API Gateway
  const handleUpload = async () => {
    if (!image) {
      alert('Por favor selecciona una imagen.');
      return;
    }

    setLoading(true);
    setStatusMessage('');
    setSuccess(false);
    setOverlayActive(true); 

    try {
      // Subir la imagen a S3 y obtener la clave del archivo
      const fileKey = await handleImageUpload(image);

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
     
      console.log('subiendo')
      const { body } = await result.response;
      const response = await body.json();
      console.log(response);
      const coincide = compararEstado(response, estadoDeseado);
      
      if (coincide) {
        setStatusMessage(`✅ Correcto: La persona coincide con el estado: ${estadoDeseado}`);
        setSuccess(true);
      } else {
        setStatusMessage(`❌ No coincide con el estado deseado: ${estadoDeseado}`);
        setSuccess(false);
      }
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      setStatusMessage('Ocurrió un error al procesar la imagen.');
      setSuccess(false);
    } finally {
      setLoading(false);
     
      setTimeout(() => {
        setOverlayActive(false); 
      }, 1000);
    }
  };



  return (
    <div >
            {overlayActive && (
        <div className={`overlay ${statusMessage ? 'active' : ''}`}>
          <div className="overlay-content">
            <p className={success ? 'success' : 'error'}>{statusMessage}</p>
          </div>
        </div>
      )}


      <div>
        <button className='random' onClick={obtenerEstadoAleatorio}>Generar estado aleatorio</button>
      </div>

      <div className='liveness-accion'>
        <p>Estado: <span className="bold"> {estadoDeseado}</span></p>
      </div>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      {uploadProgress > 0 && <p>Progreso de carga: {uploadProgress}%</p>}
      <button className='selectButton' onClick={handleUpload} disabled={loading}>
        {loading ? 'Cargando...' : 'Subir y Analizar Imagen'}
      </button>
      <div className='pageDiv'>
      {success && <button onClick={handleButtonClick} className='pageButton'>Ir a plates</button>}
      </div>
    </div>
  );
};

export default ImageUpload;
