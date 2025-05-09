import React from "react";
import '../components/Plate.css';
import { IoMdArrowBack } from "react-icons/io";

function Plate() {

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Archivo seleccionado: ", file.name);
    }
  };

  return (
    <div className="container">
        
      <div className="left-section">
        <div>
        <button className="button2"><IoMdArrowBack /> 
        </button> 
        </div>
        <label htmlFor="file-upload" className="button1">Subir</label>
        <input
          type="file"
          id="file-upload"
          accept="image/*,video/*"  
          onChange={handleFileChange}
          style={{ display: 'none' }}   
        />
    
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
