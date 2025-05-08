import React from 'react';
import './AutenticateAnimation.css';

const AutenticateAnimation = ({ animationTriggered }) => {


  return (
    <div className={`checkmark-container ${animationTriggered ? 'rotate' : ''}`}>
            
                <div className={`overlay ${animationTriggered ? 'active' : ''}`}>
              <div className="circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="green"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`checkmark-icon ${animationTriggered ? 'rotate' : ''}`}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
            </div>
  );
};

export default AutenticateAnimation;
