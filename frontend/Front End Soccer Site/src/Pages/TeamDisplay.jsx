import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TeamDisplay.css';

const API_URL = `${import.meta.env.VITE_API_URL}/draft`;

function TeamDisplay() {
    const [draftTeams, setDraftTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const { name } = location.state;

    useEffect(() => {
        fetchDraftTeams();
    }, []);

    const fetchDraftTeams = async () => {
        try {
            const response = await fetch(`${API_URL}/state`);
            const data = await response.json();
            setDraftTeams(data.draftTeams);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading teams...</div>;

    return (
        <div className="team-display-page">
            <h1 className="page-title">Teams Overview</h1>

            <div className="teams-container">
                {draftTeams.map((draftTeam) => (
                    <div key={draftTeam.userName} className="team-card">
                        <h2 className="team-name">
                            {draftTeam.userName === name ? 'You' : draftTeam.userName}
                        </h2>

                        <div className="team-stats">
                            <div className="stat">
                                <span className="stat-label">Players:</span>
                                <span className="stat-value">{draftTeam.roster.length}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Total Cost:</span>
                                <span className="stat-value">
                                    {draftTeam.roster.reduce((sum, p) => sum + p.cost, 0).toFixed(1)}
                                </span>
                            </div>
                        </div>

                        <div className="players-list">
                            {draftTeam.roster.length > 0 ? (
                                draftTeam.roster.map((player, idx) => (
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

            <button className="login-btn" style={{ marginTop: '32px' }} onClick={() => navigate('/')}>
                Play Again
            </button>
        </div>
    );
}

export default TeamDisplay;
