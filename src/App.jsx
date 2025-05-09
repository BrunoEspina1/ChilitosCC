import { useState, useEffect } from 'react';
import './App.css';
import LivenessQuickStart from './components/LivenessQuickStart';
import AutenticateAnimation from './pages/AutenticateAnimation';
import Plate from './pages/Plate';

function App() {
  const [passed, setPassed] = useState(false); 
  const [animationTriggered, setAnimationTriggered] = useState(false); // Esto activará la animación

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

  return (
    <>
      <div className='hover'></div>
      {!passed ? (
        <div className='imageProcess'>
        <LivenessQuickStart onSuccess={handleSuccess} setPassed={setPassed} setAnimationTriggered={setAnimationTriggered} />

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
