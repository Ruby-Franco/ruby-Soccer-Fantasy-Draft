import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

function NameEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode;  // "create", "join", or "solo"

  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/waiting', { state: { name: name, mode: mode } });
  };

  return (
    <div className="login-page">
        <div className="bg-ellipse" aria-hidden="true" />
        <div className="login-card">
            <div className="brand-row">
                <div className="logo-circle" style={{ marginLeft: '120px' }}>⚽</div>

            <form className="nameentry-form" onSubmit={handleSubmit}>
                <div className="field">
                     <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        autoFocus
                    />
                </div>
                <button type="submit" className="login-btn">Next</button>
            </form>
            </div>
        </div>
    </div>
);

}

export default NameEntry;
