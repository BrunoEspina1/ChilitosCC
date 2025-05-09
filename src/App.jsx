import { useState, useEffect } from 'react';
import './App.css';
import LivenessQuickStart from './components/LivenessQuickStart';
import AutenticateAnimation from './pages/AutenticateAnimation';
import Plate from './pages/Plate';

function App() {
  const [passed, setPassed] = useState(false); // Lo mantienes en true para ver la animación desde el inicio
  const [animationTriggered, setAnimationTriggered] = useState(false); // Esto activará la animación

  useEffect(() => {
    if (passed) {
        setTimeout(5000)
      setAnimationTriggered(true);
      setTimeout(() => {
        setAnimationTriggered(false);  // Reset the animation to allow it to run again
      }, 1000);  // Duration of the animation
    }
  }, [passed]);

  const handleSuccess = () => {
    setPassed(true);
  };

  return (
    <>
      {!passed ? (
        <div className='imageProcess'>
            <LivenessQuickStart onSuccess={handleSuccess} />
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
