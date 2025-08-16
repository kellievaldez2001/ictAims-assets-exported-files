
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import testUsers from './testUsers';
import './LoginPage.css';


function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = testUsers.find(u => u.username === username && u.password === password);
    if (found) {
      if (onLoginSuccess) onLoginSuccess();
      if (found.role === 'admin') {
        navigate('/'); // admin dashboard (root)
      } else if (found.role === 'user') {
        navigate('/user-dashboard');
      }
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
