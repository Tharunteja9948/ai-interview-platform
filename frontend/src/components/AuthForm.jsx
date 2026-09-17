import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

export default function AuthForm({ onAuthSuccess, onBackToLanding, savedConfigMessage }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleMode = (registerMode) => {
    setIsRegister(registerMode);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!username.trim()) {
      setError(isRegister ? 'Username is required.' : 'Username or Email is required.');
      return;
    }
    if (isRegister) {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (isRegister) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    const endpoint = isRegister ? '/api/register' : '/api/login';
    const payload = isRegister 
      ? { username: username.trim(), email: email.trim(), password }
      : { username: username.trim(), password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || (typeof data.detail === 'string' ? data.detail : (data.detail && data.detail[0]?.msg)) || 'Authentication failed. Please try again.';
        throw new Error(errorMsg);
      }

      if (isRegister) {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => {
          toggleMode(false);
        }, 1500);
      } else {
        setSuccess('Login successful! Welcome.');
        setTimeout(() => {
          onAuthSuccess(data.user || data);
        }, 1000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      {/* Back to Home Button */}
      <button 
        type="button" 
        className="back-btn" 
        onClick={onBackToLanding}
        disabled={loading}
        title="Back to Landing Page"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="auth-header">
        <div className="logo-container" style={{ marginTop: '10px' }}>
          <Sparkles size={24} style={{ color: 'var(--accent-cyan)' }} className="logo-icon" />
          <span className="logo-text">INTERVIEW.AI</span>
        </div>
        <p className="auth-subtitle">AI-Powered Interview Practice Simulator</p>
      </div>

      <div className="tab-container">
        <button
          type="button"
          className={`tab-btn ${!isRegister ? 'active' : ''}`}
          onClick={() => toggleMode(false)}
          disabled={loading}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`tab-btn ${isRegister ? 'active' : ''}`}
          onClick={() => toggleMode(true)}
          disabled={loading}
        >
          Register
        </button>
        <div 
          className="tab-indicator" 
          style={{ 
            left: isRegister ? 'calc(50% - 2px)' : '4px',
            width: 'calc(50% - 2px)'
          }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {savedConfigMessage && !error && !success && (
          <div className="alert alert-error" style={{ background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-indigo)' }}>
            <AlertCircle size={16} />
            <span>{savedConfigMessage}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="username">
            {isRegister ? 'Username' : 'Username or Email'}
          </label>
          <div className="input-wrapper">
            <User size={18} className="input-icon" />
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder={isRegister ? "Enter username" : "Enter username or email"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Email Address - Register mode only */}
        {isRegister && (
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Smooth transitioning Confirm Password field */}
        <div className={`form-group confirm-password-wrapper ${isRegister ? 'visible' : ''}`}>
          <label className="form-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="form-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required={isRegister}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner" />
              <span>Connecting...</span>
            </>
          ) : (
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
          )}
        </button>
      </form>
    </div>
  );
}
