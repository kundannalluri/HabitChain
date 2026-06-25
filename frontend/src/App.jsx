import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Leaderboard from './pages/Social/Leaderboard';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './pages/Profile/Profile';
import Landing from './pages/Landing';
import ForgotPassword from './pages/Auth/ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (No Auth Layout) */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Protected Application Routes (With Sidebar Layout) */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
