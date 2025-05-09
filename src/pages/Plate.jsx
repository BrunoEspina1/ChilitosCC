import React, { useState } from "react";
import '../components/Plate.css';
import { IoMdArrowBack } from "react-icons/io";
import { FaUpload } from "react-icons/fa6";
import { post } from 'aws-amplify/api';
import { uploadData, downloadData } from 'aws-amplify/storage';
import WebcamVideo from '../components/WebcamVideo';
import { validatePlates } from "../components/validatePlate"; // Asumiendo que validatePlates ya está importado

function Plate() {
  const [path, setPath] = useState(false);
  const [plates, setPlates] = useState([]); // Estado para almacenar las placas verificadas
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Estado para manejar el modal
  const [platesLoaded, setPlatesLoaded] = useState(false); // Estado para verificar si las placas están cargadas

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
      console.log('filename: ', fileName);
      const uploadedFile = await uploadData({
        path: `public/${fileName}`,
        data: videoBlob,
        options: {},
      }).result;

      setPath(fileName);
      jobId = await analyzeVideo(fileName);

      console.log('Esperando para agarrar las placas...');
      setTimeout(() => {
        console.log('Voy por las placas');
        fetchPlates(jobId);
      }, 45000);
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

      return response.jobId;
    } catch (error) {
      console.error('Error al analizar el video: ', error);
    }
  };

  const fetchPlates = async (jobId) => {
    try {
      console.log('Job fetcheado: ', jobId);
      const downloadResult = await downloadData({
        path: `public/${jobId}-plates.json`
      }).result;

      console.log('S3 data:');
      const text = await downloadResult.body.text();
      const data = JSON.parse(text);
      console.log(data); 

      const platesArray = data.uniquePlates;
      console.log('Placas encontradas:', platesArray);

      // Validar las placas con la función `validatePlates`
      const validatedPlates = validatePlates(platesArray); // Validar las placas

      // Mock data: Asignar datos de reporte a cada placa validada
      const mockedPlatesData = validatedPlates.validated.map(plate => {
        const expirationDates = [
          "2025-08-15",
          "2025-09-10",
          "2025-07-20",
          "2026-01-05",
          "2026-02-28",
        ];

        const owners = [
          "Juan Pérez",
          "Ana Gómez",
          "Carlos Sánchez",
          "María Rodríguez",
          "Luis Fernández",
          "Patricia Díaz",
          "Jorge Martínez",
          "Laura García",
        ];

        const getRandomValue = (arr) => arr[Math.floor(Math.random() * arr.length)];

        return {
          ...plate, // Placa y estado
          stolen: plate.state === "Ciudad de México" ? "¡Robada!" : "No reportada",
          fine: "Sin incidencias",
          expiration: getRandomValue(expirationDates), // Fecha de expiración aleatoria
          owner: getRandomValue(owners), // Propietario aleatorio
        };
      });

      setPlates(mockedPlatesData); // Actualizar con las placas y sus datos simulados
      setModalOpen(true); // Abrir el modal con la tabla
      setPlatesLoaded(true); // Marcar que las placas están cargadas
    } catch (error) {
      console.error('Error al obtener las placas: ', error);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const closeModal = () => {
    setModalOpen(false); // Cerrar el modal
  };

  const openModal = () => {
    setModalOpen(true); // Abrir el modal
  };

  const convertToCSV = (data) => {
    const header = ["Placa", "Estado", "Multa", "Fecha Expiración", "Propietario"];
    const rows = data.map(plate => [
      plate.plate,
      plate.state,
      plate.fine,
      plate.expiration,
      plate.owner
    ]);

    const csvContent = [
      header.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    return csvContent;
  };

  const downloadCSV = (data) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "placas.csv";
    link.click();
  };

  // Nueva función para manejar la apertura del modal solo si las placas han sido cargadas
  const handleOpenModal = () => {
    if (plates.length === 0) {
      alert("Por favor, sube un archivo o graba un video para continuar.");
    } else {
      setModalOpen(true); // Abrir el modal si ya se ha cargado el contenido
    }
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
          {plates.length > 0 ? (
            <p>Placas Verificadas: {plates.length}</p>
          ) : (
            <p>No hay placas verificadas.</p>
          )}
          {/* Botón para abrir el modal */}
          <button onClick={handleOpenModal} className="ver" disabled={!platesLoaded}>
            Ver detalles de las placas
          </button>
          <button onClick={() => downloadCSV(plates)} className="download-csv-btn" disabled={!platesLoaded}>
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Modal de la tabla */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>x</button>
            <h2>Datos de Placas</h2>
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Estado</th>
                  <th>Multa</th>
                  <th>Fecha Expiración</th>
                  <th>Propietario</th>
                </tr>
              </thead>
              <tbody>
                {plates.map((plate, index) => (
                  <tr key={index}>
                    <td>{plate.plate}</td>
                    <td>{plate.state}</td>
                    <td>{plate.fine}</td>
                    <td>{plate.expiration}</td>
                    <td>{plate.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plate;
