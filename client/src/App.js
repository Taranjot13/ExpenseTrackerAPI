import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, loading, loadUser, logout } = useAuth();

  useEffect(() => {
    // Only load user if a token exists, to avoid unnecessary API calls
    if (localStorage.token) {
      loadUser();
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <a href="#!" onClick={logout}>Logout</a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        <div className="container">
          <Routes>
            <Route path="/" element={!isAuthenticated && !loading ? <Home /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
