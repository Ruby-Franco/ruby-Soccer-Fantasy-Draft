import './App.css'; 
import Login from './Pages/Login.jsx'; 
import Waiting from './Pages/Waiting.jsx';
import UserChoice from './Pages/UserChoice.jsx';
import TeamDisplay from './Pages/TeamDisplay.jsx';
import NameEntry from './Pages/NameEntry.jsx';
import {HashRouter as Router, Routes, Route} from 'react-router-dom'; 

function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Login/>}/> 
        <Route path="/nameentry" element={<NameEntry/>}/>
        <Route path="/waiting" element={<Waiting/>}/>
        <Route path="/userchoice" element={<UserChoice/>}/> 
        <Route path="/teamdisplay" element={<TeamDisplay/>}/>
      </Routes>
    </Router>
  ); 
}

export default App;
