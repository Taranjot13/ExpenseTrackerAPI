import React from 'react';
import TopNav from './TopNav';

const Layout = ({ children }) => {
  return (
    <div className="appShell">
      <div className="bg" aria-hidden="true" />
      <TopNav />
      <main className="main">
        <div className="container">{children}</div>
      </main>
      <footer className="footer">
        <div className="container footer__inner">
          <div className="muted">ExpenseTracker API • React client</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
