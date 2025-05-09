import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { post } from 'aws-amplify/api';

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      alert('Análisis facial completado');
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Ocurrió un error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {uploadProgress > 0 && <p>Progreso de carga: {uploadProgress}%</p>}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Cargando...' : 'Subir y Analizar Imagen'}
      </button>
    </div>
  );
};

export default ImageUpload;
