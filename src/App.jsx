import { useState, useEffect } from 'react';
import './App.css';
import LivenessQuickStart from './components/LivenessQuickStart';
import AutenticateAnimation from './pages/AutenticateAnimation';
import Plate from './pages/Plate';
import { IoIosCloseCircleOutline } from "react-icons/io";


function App() {
  const [passed, setPassed] = useState(false); 
  const [animationTriggered, setAnimationTriggered] = useState(false); 
  const [showPopup, setShowPopup] = useState(false); 


  useEffect(() => {
    if (passed) {
        setTimeout(5000)
      setAnimationTriggered(true);
      setTimeout(() => {
        setAnimationTriggered(false);  
      }, 1000);  
    }
  }, [passed]);

  const handleSuccess = () => {
    setPassed(true);
  };


  const handlePopupToggle = () => {
    setShowPopup(!showPopup); // Cambiar el estado del popup
  };

  return (
    <>
      <div className='hover'></div>
      {!passed ? (
        <div className='imageProcess'>
        <LivenessQuickStart onSuccess={handleSuccess} setPassed={setPassed} setAnimationTriggered={setAnimationTriggered} />
        <a href="#" onClick={handlePopupToggle}>
          
            <span className="text">Términos y condiciones</span>
            
          </a>
          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <p>Términos y Condiciones – Seguridad y Privacidad de Datos

Finalidad del procesamiento de datos biométricos
Durante el uso de esta herramienta, se capturan imágenes o videos del rostro del usuario exclusivamente con el propósito de realizar un análisis de prueba de vida mediante visión por computadora.

Uso limitado de los datos
Las imágenes y videos obtenidos:

No serán utilizados con fines distintos a la validación de la prueba de vida.

No serán compartidos con terceros bajo ninguna circunstancia.

No serán utilizados para entrenar modelos de inteligencia artificial ni para ningún otro análisis posterior.

Almacenamiento y conservación
Los datos (imágenes/video y resultado) se almacenan temporalmente y de manera segura para fines de registro y auditoría, incluyendo la fecha y hora de la prueba. Dichos datos podrán conservarse por un periodo limitado y serán eliminados de forma segura tras cumplir su finalidad.

Cumplimiento normativo
El sistema cumple con las normativas de protección de datos aplicables, como el Reglamento General de Protección de Datos (GDPR) y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), garantizando los derechos de los usuarios sobre sus datos personales.

Derechos del usuario
El usuario podrá ejercer en cualquier momento sus derechos de acceso, rectificación, cancelación u oposición (ARCO) sobre los datos recopilados, contactando al responsable del tratamiento de datos indicado por la institución que administra esta herramienta.

Consentimiento informado
Al utilizar esta herramienta, el usuario acepta voluntariamente la captura y el procesamiento de su imagen con los fines descritos anteriormente.

</p>
                <button className="close-btn" onClick={handlePopupToggle}><IoIosCloseCircleOutline />
                </button>
              </div>
            </div>
          )}
        </div>
        
      ) : (
        <>
            <AutenticateAnimation animationTriggered={animationTriggered}/>
            <div>
                <Plate></Plate>
            </div>
            
        </>
      )}
      
    </>
  );
}

export default App;