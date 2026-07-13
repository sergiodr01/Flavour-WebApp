import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(loginValue, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <h1>Flavour WebApp</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            type="email"
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
