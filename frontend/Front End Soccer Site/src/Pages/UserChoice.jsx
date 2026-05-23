import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserChoice.css';
//const API_URL = 'http://localhost:3000/draft';
const API_URL = `${import.meta.env.VITE_API_URL}/draft`;

function UserChoice(){

    const navigate = useNavigate();
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [pointsLeft, setPointsLeft] = useState(100);
    const [currentTeam, setCurrentTeam] = useState([]);
    const [currentParticipant, setCurrentParticipant] = useState(null);

    const location = useLocation();
    const { name } = location.state;
    const [myParticipantId] = useState(name);

    useEffect(() => {
    check_InitializedDraft();
    }, []);

   useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/draft/current`)
        .then(res => res.json())
        .then(data => setCurrentParticipant(data));
    }, []);

    // Add another useEffect to refresh when component is visible
    useEffect(() => {
        // Refresh state when returning to this page
        const handleFocus = () => {
            console.log('Page visible, refreshing state...');
            fetchDraftState();
        };

        window.addEventListener('focus', handleFocus);
        
        // Also refresh when the page is shown (browser back/forward)
        window.addEventListener('pageshow', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('pageshow', handleFocus);
        };
    }, []);


    // this checks if draft has been initializes and only init if needed
    const check_InitializedDraft = async () => { 
        try{    
            const response = await fetch(`${API_URL}/state`);
            const data = await response.json(); 

            console.log('draft state check: ', data);

            if(!data.availablePlayers || data.availablePlayers.length === 0){
                console.log('No players found, initializing draft...');
                await initializeDraft();
            } else {
                // Draft already initialized, just fetch state
                await fetchDraftState();
            }
            

        } catch (error ){
            console.error('Error checking draft state:', error);
            await initializeDraft();
        }
    };

    const initializeDraft = async () => {
        try {
            const resetResponse = await fetch(`${API_URL}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participants: [
                        { participantId: myParticipantId, teamId: "team1", order: 0, team: [] },
                        { participantId: "user2", teamId: "team2", order: 1, team: [] }
                    ]
                })
            });
            
            if (resetResponse.ok) {
                console.log('Draft initialized successfully');
                await fetchDraftState();
            }
        } catch (error) {
            console.error('Error initializing draft:', error);
        }
    };

    const fetchDraftState = async () => {
        try {
            const response = await fetch(`${API_URL}/state`);
            const data = await response.json();
            
            
            console.log('Fetched draft state:', data);
            console.log('Available players:', data.availablePlayers?.length);
            console.log('My team:', data.participants.find(p => p.participantId === myParticipantId)?.team);
            
            
            setCurrentRound(data.currentRound);
            
            const myParticipant = data.participants.find(p => p.participantId === myParticipantId);
            
            if (myParticipant) {
                setCurrentParticipant(myParticipant);
                setCurrentTeam(myParticipant.team);
                
                // Calculate points left for MY team
                const usedPoints = myParticipant.team.reduce((sum, player) => sum + player.cost, 0);
                setPointsLeft(100 - usedPoints);
            }    
            
            // Get available players (not picked yet)
            const selectedIds = Array.isArray(data.selectedPlayerIds) 
                ? data.selectedPlayerIds 
                : Array.from(data.selectedPlayerIds || []);

            console.log('Selected IDs after conversion:', selectedIds);

            const available = data.availablePlayers.filter(
                player => !selectedIds.includes(String(player.id))
            );

            console.log('Filtered available players:', available);
            setAvailablePlayers(available);
            
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
                
                const myParticipant = draftState.participants.find(p => p.participantId === myParticipantId);
                
                // END GAME AFTER 2 rounds
                if (myParticipant && myParticipant.team.length >= 3) {
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
                    Your Team:
                </div>
                
                <div className="team-slots">
                    {[...Array(5)].map((_, idx) => {
                        const player = currentTeam[idx];
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
                    {availablePlayers.map((athlete) => (
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

export default UserChoice  