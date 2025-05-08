import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import LivenessQuickStart from './components/LivenessQuickStart';

function App() {
  const [passed, setPassed] = useState(false);

  return (
    <>
      {!passed ? (
        <LivenessQuickStart onSuccess={() => setPassed(true)} />
      ) : (
        <>
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
          </div>
        </>
      )}
    </>
  );
}

export default App;
