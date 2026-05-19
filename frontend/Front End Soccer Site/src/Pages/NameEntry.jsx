import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NameEntry.css';

function NameEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode;  // "create", "join", or "solo"

  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/waiting', { state: { name: name } });
  };

  return (
    <form onSubmit={handleSubmit}>
        <div className="field">
            <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
                autoCapitalize="off"
                autoCorrect="off"
            />
            <button type="submit" className="name-btn"> Next</button>  
        </div>
    </form>
  );
}

export default NameEntry;
