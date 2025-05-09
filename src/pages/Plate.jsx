import React, { useState } from "react";
import '../components/Plate.css';
import { IoMdArrowBack } from "react-icons/io";
import { FaUpload } from "react-icons/fa6";
import { post } from 'aws-amplify/api';
import { uploadData, getProperties, downloadData } from 'aws-amplify/storage';
import WebcamVideo from '../components/WebcamVideo'
import { LuAppWindowMac } from "react-icons/lu";

function Plate() {

  const [path, setPath] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Archivo seleccionado: ", file.name);
      sendVideo(file);
    }
  };

  const sendVideo = async (videoBlob) => {
    try {
      let jobId = '';
      const fileName = `webcam-video-${Date.now()}.mp4`;
      console.log('filename: ', fileName)
      const uploadedFile = uploadData({
        path: `public/${fileName}`,
        data: videoBlob,
        options: {},
      }).result;

      setTimeout(() => {

      },3000)
      setPath(fileName);
      jobId = await analyzeVideo(fileName);

      console.log('Esperando para agarrar las placas....');
      setTimeout(() => {
        console.log('Voy por las placas');
        fetchPlates(jobId);
      },45000)
    } catch (error) {
      console.error('Error al cargar el video:', error);
    }
  };

  const analyzeVideo = async (fileKey) => {
    try {
      const finalFileKey = 'public/' + fileKey;
      console.log('fileKey: ', finalFileKey);
      const res = await post({
        apiName: 'CCApi',
        path: '/video/process',
        options: {
          body: {
            bucket: 'chilitosccb57f042b6f394b9c86efe0bb3430ab2757ab7-dev',
            key: finalFileKey,
          },
        },
      });
  
      const { body } = await res.response;
      const response = await body.json();
      console.log(response);
      console.log('JobId: ', response.jobId);
  
      return response.jobId;  // Retornamos el jobId correctamente
    } catch (error) {
      console.error('Error al analizar el video: ', error);
    }
  };

  const fetchPlates = async (jobId) => {
    try{
      console.log('Job fetcheado: ', jobId);
      const downloadResult = await downloadData({
        path: `public/${jobId}-plates.json`
      }).result;

      console.log('S3 data:')
      const text = await downloadResult.body.text();
      console.log(text);
      
      const data = JSON.parse(text);
      console.log(data);  // Verifica el contenido del objeto JSON
      
      // Acceder al array de placas
      const plates = data.uniquePlates;
      console.log('Placas encontradas:', plates);
    }
    catch(error){
      console.error('Error al obtener las placas: ', error);
    }
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="container">
        
      <div className="left-section">
        <div>
        <button onClick={handleReload} className="back-btn"><IoMdArrowBack /> 
        </button> 
        </div>
        
        <label htmlFor="file-upload" className="upload-btn"><FaUpload/><p>Subir</p></label>
        <input
          type="file"
          id="file-upload"
          accept="image/*,video/*"  
          onChange={handleFileChange}
          style={{ display: 'none' }}   
        />
    
      </div>
        <div className="video-card">
          <WebcamVideo />
        </div>
      <div className="right-section">
        <div className="license-plate">
          <p>Placa: 98-XYZ-AA</p>
          <p className="stolen">¡Robada!</p>
          <p>Multas velocidad</p>
          <p>Info gral</p>
        </div>
      </div>
    </div>
  );
}

export default Plate;
