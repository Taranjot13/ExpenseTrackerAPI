import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopNav = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="topnav__brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">ExpenseTracker</span>
        </Link>

        <nav className="topnav__links" aria-label="Primary">
          {!isAuthenticated ? (
            <>
              <NavLink className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}
                to="/"
                end
              >
                Home
              </NavLink>
              <NavLink className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}
                to="/login"
              >
                Login
              </NavLink>
              <NavLink className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}
                to="/register"
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}
                to="/dashboard"
              >
                Dashboard
              </NavLink>
            </>
          )}
        </nav>

        <div className="topnav__actions">
          {isAuthenticated ? (
            <>
              <div className="topnav__user" title={user?.email || ''}>
                <div className="avatar" aria-hidden="true">
                  {(user?.name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="topnav__userText">
                  <div className="topnav__userName">{user?.name || 'Account'}</div>
                  <div className="topnav__userMeta">Signed in</div>
                </div>
              </div>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="btn btn--primary" to="/register">
              Get started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
