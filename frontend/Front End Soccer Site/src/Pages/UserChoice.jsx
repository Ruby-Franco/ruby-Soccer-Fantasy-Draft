import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserChoice.css';

const API_URL = `${import.meta.env.VITE_API_URL}/draft`;

function UserChoice(){

    const navigate = useNavigate();
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [playerPool, setPlayerPool] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [pointsLeft, setPointsLeft] = useState(100);
    const [myRoster, setMyRoster] = useState([]);

    const location = useLocation();
    const { name } = location.state;

    useEffect(() => {
        fetchDraftState();
    }, []);

    const fetchDraftState = async () => {
        try {
            const response = await fetch(`${API_URL}/state`);
            const data = await response.json();

            setCurrentRound(data.currentRound);

            const myDraftTeam = data.draftTeams.find(t => t.userName === name);

            if (myDraftTeam) {
                setMyRoster(myDraftTeam.roster);
                const usedPoints = myDraftTeam.roster.reduce((sum, player) => sum + player.cost, 0);
                setPointsLeft(100 - usedPoints);
            }

            const selectedIds = Array.isArray(data.selectedSoccerPlayerIds)
                ? data.selectedSoccerPlayerIds
                : Array.from(data.selectedSoccerPlayerIds || []);

            const available = data.playerPool.filter(
                player => !selectedIds.includes(String(player.id))
            );

            setPlayerPool(available);

        } catch (error) {
            console.error('Error fetching draft state:', error);
        }
    };

    const handlePlayerClick = (player) => {
        setSelectedAthlete(player);
    };

    const handleSelect = async () => {
        if (!selectedAthlete) {
            alert("Please select a player first!");
            return;
        }

        if (selectedAthlete.cost > pointsLeft) {
            alert("Not enough points to select this player!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/pick`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: String(selectedAthlete.id) })
            });

            const result = await response.json();

            if (result.ok) {
                setSelectedAthlete(null);

                const stateResponse = await fetch(`${API_URL}/state`);
                const draftState = await stateResponse.json();

                const myDraftTeam = draftState.draftTeams.find(t => t.userName === name);

                if (myDraftTeam && myDraftTeam.roster.length >= 3) {
                    navigate('/teamdisplay', { state: { name, mode: 'create' } });
                } else {
                    navigate('/waiting', { state: { name, mode: 'create' } });
                }

            } else {
                alert(result.message || 'Failed to pick player');
            }
        } catch (error) {
            console.error('Error picking player:', error);
            alert('Error picking player');
        }
    };

    return(
        <div className="player-select-page">
            <div className='status-container'>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    Current Round: {currentRound}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    Points Left: {pointsLeft}
                </div>
            </div>

            <div className='status-container team-container'>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem' }}>
                    Your Roster:
                </div>

                <div className="team-slots">
                    {[...Array(5)].map((_, idx) => {
                        const player = myRoster[idx];
                        return (
                            <span key={idx} className={player ? 'team-slot filled' : 'team-slot empty'}>
                                {player ? player.name : `Player ${idx + 1}`}
                                {idx < 4 && <span className="separator"> | </span>}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className='athletes-container'>
                <div className='athletes-header'>
                    <h2>    Player Name</h2>
                    <h2>Position</h2>
                    <h2>Club</h2>
                    <h2>Points Cost</h2>
                </div>

                <div className='athletes-list flex'>
                    {playerPool.map((athlete) => (
                        <div
                            key={athlete.id}
                            className={`player-row ${selectedAthlete?.id === athlete.id ? 'selected' : ''}`}
                            onClick={() => handlePlayerClick(athlete)}
                        >
                            <div>{athlete.name}</div>
                            <div>{athlete.position}</div>
                            <div>{athlete.club}</div>
                            <div>{athlete.cost}</div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="select-btn" onClick={handleSelect}>
                Select
            </button>

        </div>
    );
}

export default UserChoice;
