import React, { useState, useEffect } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { post } from 'aws-amplify/api';
import WebcamCapture from './WebcamCapture';

export const opcionesEstados = [
  "Sonrie", 
  "Boca_abierta", 
  "Ojos abiertos", 
  "Feliz", 
  "Sorprendido",
  "Calmado", 
  "Confundido", 
  "Disgustado", 
  "Triste", 
  "Miedo", 
  "Enojado", 
  "Sonriente", 
  "Abre_la_boca", 
  "Abre_los_ojos", 
  "Riendo", 
  "Asombrado", 
  "Relajado", 
  "Confundida", 
  "Molesto", 
  "Frunce_el_ceño", 
  "Cara_Desagrado", 
  "Cara_llorando", 
  "Cara_Nervioso", 
  "Cara_Temeroso"
];


const ImageUpload = ({ onSuccess, setPassed, setAnimationTriggered }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estadoDeseado, setEstadoDeseado] = useState('sonrie'); 
  const [statusMessage, setStatusMessage] = useState('');  
  const [success, setSuccess] = useState(false); 
  const [overlayActive, setOverlayActive] = useState(false);
  const [animating, setAnimating] = useState(true);
   
  const setSuccess2= (state)=> {
      setSuccess(state)
  }

  const handleButtonClick = () => {
  
    setPassed(true); 
    setAnimationTriggered(true);  
    onSuccess(); 
  };

 
  useEffect(() => {
    const obtenerEstadoAleatorio = () => {
      const aleatorio = opcionesEstados[Math.floor(Math.random() * opcionesEstados.length)];
      setEstadoDeseado(aleatorio);
    };
    obtenerEstadoAleatorio();  // Ejecuta la función automáticamente al cargar la página
  }, []);


  const compararEstado = (resultadoAWS, estadoDeseado) => {
    const emociones = resultadoAWS.faces[0].emotions.reduce((acc, emo) => {
      acc[emo.Type.toLowerCase()] = emo.Confidence > 90; 
      return acc;
    }, {});

  
const resultado = {
  Sonrie: resultadoAWS.faces[0].smile?.Value === true,
  Boca_abierta: resultadoAWS.faces[0].mouthOpen?.Value === true,
  Ojos_abiertos: resultadoAWS.faces[0].eyesOpen?.Value === true,

  Feliz: emociones['happy'] || false,
  Sorprendido: emociones['surprised'] || false,
  Calmado: emociones['calm'] || false,
  Confundido: emociones['confused'] || false,
  Disgustado: emociones['disgusted'] || false,
  Triste: emociones['sad'] || false,
  Miedo: emociones['fear'] || false,
  Enojado: emociones['angry'] || false,

  Sonriente: resultadoAWS.faces[0].smile?.Value === true,
  Abre_la_boca: resultadoAWS.faces[0].mouthOpen?.Value === true,
  Abre_los_ojos: resultadoAWS.faces[0].eyesOpen?.Value === true,

  Riendo: emociones['happy'] || false,
  Asombrado: emociones['surprised'] || false,
  Relajado: emociones['calm'] || false,
  Confundida: emociones['confused'] || false,
  Molesto: emociones['angry'] || false,
  Frunce_el_ceño: emociones['angry'] || false,
  Cara_Desagrado: emociones['disgusted'] || false,
  Cara_llorando: emociones['sad'] || false,
  Cara_Nervioso: emociones['fear'] || false,
  Cara_Temeroso: emociones['fear'] || false,
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
      const fileKey = await handleImageUpload(image)

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


  useEffect(() => {
    // Función para cambiar rápidamente las palabras
    const interval = setInterval(() => {
      if (animating) {
        const aleatorio = opcionesEstados[Math.floor(Math.random() * opcionesEstados.length)];
        setEstadoDeseado(aleatorio);
      }
    }, 100); // Cambia el texto cada 100ms

    // Detener la animación después de 2 segundos
    const timeout = setTimeout(() => {
      setAnimating(false);  // Detenemos la animación
    }, 2000); // Detener después de 2 segundos

    // Limpiar los intervalos y timeouts al desmontar el componente
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [animating]);


  return (
    
    <div >
      

            {overlayActive && (
        <div className={`overlay ${statusMessage ? 'active' : ''}`}>
          <div className="overlay-content">
            <p className={success ? 'success' : 'error'}>{statusMessage}</p>
          </div>
        </div>
      )}
      
        {/* <button className='random' onClick={obtenerEstadoAleatorio}>Generar estado aleatorio</button> */}
       
       
        <div className='liveness-accion'>
        <span className="bold"> {estadoDeseado}</span>
      </div>

      <div className='webCam'>
      
      <WebcamCapture estadoDeseado={estadoDeseado} setSuccess={setSuccess2}
      setPassed={setPassed}/>
      </div>
     
      <div className='pageDiv'>
      {success && <button onClick={handleButtonClick} className='pageButton'>Ir a plates</button>}
      </div>
    </div>
  );
};

export default ImageUpload;
