import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, loading, loadUser } = useAuth();

  useEffect(() => {
    // Only load user if a token exists, to avoid unnecessary API calls
    if (localStorage.token) {
      loadUser();
    }
  }, []);

  return (
    <Router>
      <Layout>
          <Routes>
            <Route path="/" element={!isAuthenticated && !loading ? <Home /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
      </Layout>
    </Router>
  );
}

export default App;
