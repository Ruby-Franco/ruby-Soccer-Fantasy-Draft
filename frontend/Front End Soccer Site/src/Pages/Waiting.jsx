// Waiting.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Waiting.css';

function Waiting() {

const location = useLocation();
const navigate = useNavigate()

const {name, mode } = location.state;
//console.log(name, mode);

const [currentParticipant, setCurrentParticipant] = useState(null);

 //console.log(import.meta.env.VITE_API_URL); 

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/draft/current`)
        .then(res => res.json())
        .then(data => setCurrentParticipant(data));
  }, []);



  if (!currentParticipant) return <div>Loading...</div>;

  return (
    <div className="waitingPage">
      <div className="hero">
        <h1 className="header">It's {currentParticipant?.participantId}'s Turn...</h1>
        <h3 className="subtitle">Wait until your turn!</h3>

        {currentParticipant.participantId === name && (
            <button className="nextButton" onClick={() => navigate('/userchoice', { state: { name } })}>
                Next
            </button>
        )}
      </div>

      <div className="circle" aria-hidden="true" />
    </div>
  );
}

export default Waiting;



