import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Simple Components
const Home = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Welcome to GlassERP</h1>
    <p>Complete ERP Solution for Glass Manufacturing</p>
    <a href="/login" style={{
      display: 'inline-block',
      padding: '12px 30px',
      background: '#2c3e50',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '5px',
      marginTop: '20px'
    }}>
      Go to Login
    </a>
  </div>
);

const Login = () => {
  const handleLogin = (e) => {
    e.preventDefault();
    alert('Login feature will be added soon!');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        width: '400px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>GlassERP Login</h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Don't have an account? <a href="/register" style={{ color: '#3498db' }}>Sign up</a>
          </p>
          <p style={{ color: '#666', fontSize: '12px', marginTop: '20px' }}>
            © 2024 GlassERP Pro. Powered by <strong>S.A.P.U.T</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

const Register = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Registration Page</h1>
    <p>Coming soon...</p>
    <a href="/" style={{ color: '#3498db' }}>Back to Home</a>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
