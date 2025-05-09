import React from "react";
import '../components/Plate.css';
import { IoMdArrowBack } from "react-icons/io";
import WebcamVideo from "../components/WebcamVideo";
import { FaUpload } from "react-icons/fa6";

function Plate() {

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Archivo seleccionado: ", file.name);
    }
  };

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
            <WebcamVideo/>
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
