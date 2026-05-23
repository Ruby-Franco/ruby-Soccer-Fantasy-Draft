import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TeamDisplay.css';

//const API_URL = 'http://localhost:3000/draft';
const API_URL =  `${import.meta.env.VITE_API_URL}/draft`;

function TeamDisplay() {
    const [myTeam, setMyTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const { name } = location.state;
    const [myParticipantId] = useState(name);

    // Hard-coded teams for Alice, Noah, and James
    // Excluding top 5: Achraf Hakimi, Marquinhos, Gianluigi Donnarumma, Ousmane Dembélé, Yann Sommer
    const aliceTeam = [
        { name: "Joshua Kimmich", position: "MIDFIELDER", club: "FC Bayern München", cost: 9.8 },
        { name: "Kylian Mbappé", position: "FORWARD", club: "Real Madrid C.F.", cost: 12.1 },
       // { name: "Leandro Trossard", position: "MIDFIELDER", club: "Arsenal FC", cost: 9.9 }
    ];

    const noahTeam = [
        { name: "Luka Modrić", position: "MIDFIELDER", club: "Real Madrid C.F.", cost: 8.6 },
        { name: "Antonio Rüdiger", position: "DEFENDER", club: "Real Madrid C.F.", cost: 9.0 },
       // { name: "Harry Kane", position: "FORWARD", club: "FC Bayern München", cost: 14.1 }
    ];

    const jamesTeam = [
        { name: "Robert Lewandowski", position: "FORWARD", club: "FC Barcelona", cost: 13.5 },
        { name: "Julian Brandt", position: "MIDFIELDER", club: "Borussia Dortmund", cost: 9.2 },
      //  { name: "Henrikh Mkhitaryan", position: "MIDFIELDER", club: "FC Internazionale Milano", cost: 8.3 }
    ];

    useEffect(() => {
        fetchMyTeam();
    }, []);

    const fetchMyTeam = async () => {
        try {
            const response = await fetch(`${API_URL}/state`);
            const data = await response.json();
            
            // Get just YOUR team (user1 or You)
            const myParticipant = data.participants.find(
                p => p.participantId === name || p.participantId === name
            );
            
            setMyTeam(myParticipant?.team || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching my team:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading teams...</div>;
    }

    const allTeams = [
        { name: "You", team: myTeam },
        { name: "Alice", team: aliceTeam },
        { name: "Noah", team: noahTeam },
        { name: "James", team: jamesTeam }
    ];

    return (
        <div className="team-display-page">
            <h1 className="page-title">Teams Overview</h1>
            
            <div className="teams-container">
                {allTeams.map((participant) => (
                    <div key={participant.name} className="team-card">
                        <h2 className="team-name">{participant.name}</h2>
                        
                        <div className="team-stats">
                            <div className="stat">
                                <span className="stat-label">Players:</span>
                                <span className="stat-value">{participant.team.length}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Total Cost:</span>
                                <span className="stat-value">
                                    {participant.team.reduce((sum, player) => sum + player.cost, 0).toFixed(1)}
                                </span>
                            </div>
                        </div>

                        <div className="players-list">
                            {participant.team.length > 0 ? (
                                participant.team.map((player, idx) => (
                                    <div key={idx} className="player-card">
                                        <div className="player-number">{idx + 1}</div>
                                        <div className="player-info">
                                            <div className="player-name">{player.name}</div>
                                            <div className="player-details">
                                                {player.position} • {player.club} • {player.cost} pts
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-players">No players selected</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TeamDisplay;