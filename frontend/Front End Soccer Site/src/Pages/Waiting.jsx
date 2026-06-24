import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Waiting.css';

const API_URL = `${import.meta.env.VITE_API_URL}/draft`;

function Waiting() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state;
  const [currentDraftTeam, setCurrentDraftTeam] = useState(null);
  const [botPicking, setBotPicking] = useState(false);

  const autoPickForBot = async () => {
    setBotPicking(true);

    const stateRes = await fetch(`${API_URL}/state`);
    const state = await stateRes.json();

    const selectedIds = Array.isArray(state.selectedSoccerPlayerIds)
      ? state.selectedSoccerPlayerIds
      : Array.from(state.selectedSoccerPlayerIds || []);

    const available = state.playerPool.filter(
      p => !selectedIds.includes(String(p.id))
    );

    if (available.length === 0) {
      setBotPicking(false);
      return;
    }

    const randomPlayer = available[Math.floor(Math.random() * available.length)];

    await fetch(`${API_URL}/pick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: String(randomPlayer.id) })
    });

    const currentRes = await fetch(`${API_URL}/current`);
    const current = await currentRes.json();
    setCurrentDraftTeam(current);
    setBotPicking(false);
  };

  useEffect(() => {
    fetch(`${API_URL}/current`)
      .then(res => res.json())
      .then(data => {
        setCurrentDraftTeam(data);
        if (data.userName !== name) {
          setTimeout(() => autoPickForBot(), 1000);
        }
      });
  }, []);

  if (!currentDraftTeam) return <div>Loading...</div>;

  return (
    <div className="waitingPage">
      <div className="hero">
        <h1 className="header">
          {botPicking
            ? `${currentDraftTeam.userName} is picking...`
            : `It's ${currentDraftTeam.userName}'s Turn...`}
        </h1>
        <h3 className="subtitle">Wait until your turn!</h3>

        {currentDraftTeam.userName === name && (
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
