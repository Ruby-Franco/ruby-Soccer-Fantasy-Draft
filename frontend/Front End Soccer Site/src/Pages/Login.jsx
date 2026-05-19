import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">  
        <div className="bg-ellipse" aria-hidden="true" />
        <div className="login-card">
          <div className="brand-row">
            <div className="logo-circle">⚽</div>
            <h1 className="login-title">
              <span>Fantasy</span>
              <span>Soccer</span>
            </h1>
          </div>

          <button  className="login-btn" onClick={ ()=> navigate('/nameentry', {state: {mode: 'create'}} )} >
            Create Room 
          </button>
          <button  className="login-btn" onClick={ ()=> navigate('/nameentry', {state: {mode: 'join'}} )} >
            Join Room 
          </button>
          <button  className="login-btn" onClick={ ()=> navigate('/nameentry', {state: {mode: 'solo'}} )} >
            Solo Demo 
          </button>    
      </div>
    </div>
  );
}

export default Login;
