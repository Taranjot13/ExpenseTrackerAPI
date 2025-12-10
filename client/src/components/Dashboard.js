import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
      {user && <h3>Welcome, {user.name}</h3>}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
