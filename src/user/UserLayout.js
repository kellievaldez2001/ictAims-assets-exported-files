import React from 'react';

import UserSidebar from './UserSidebar';
import UserNavbar from './UserNavbar';
import './UserLayout.css';


function UserLayout({ children }) {
  return (
    <div className="user-layout" style={{ flexDirection: 'column' }}>
      <UserNavbar />
      <div style={{ display: 'flex', flexGrow: 1, minHeight: 'calc(100vh - 64px)' }}>
        <UserSidebar />
        <main className="user-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
