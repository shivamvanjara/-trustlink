import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainDashboard from './MainDashboard';
import Auth from './pages/Auth';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import HowItWorks from './pages/HowItWorks';
import FutureScope from './pages/FutureScope';
import { SOCKET_URL } from './apiConfig';

function App() {
  const [role, setRole] = useState('seeker'); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(SOCKET_URL);
      newSocket.emit('join_user_room', user._id.toString());
      setSocket(newSocket);
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth user={user} setUser={setUser} role={role} setRole={setRole} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
      <Route path="/dashboard" element={user ? <MainDashboard role={role} isDarkMode={isDarkMode} user={user} setUser={setUser} socket={socket} /> : <Navigate to="/login" />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/future-scope" element={<FutureScope />} />
    </Routes>
  );
}

export default App;