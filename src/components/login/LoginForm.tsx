import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import BackButton from '../utility/BackNavigation';
import './LoginForm.css';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();
  const mobileNumber =
    (location.state as { mobileNumber?: string } | undefined)?.mobileNumber ??
    '';

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);

    setTimeout(() => {
      alert(`Logged in with ${mobileNumber}`);
      setIsLoggingIn(false);
    }, 1000);
  }

  return (
    <div className="login-form">
      <BackButton fallbackTo="/" />

      <h2>Welcome back!</h2>
      <p>Mobile: {mobileNumber || 'Not provided'}</p>

      <form onSubmit={handleLogin}>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="login-button" disabled={isLoggingIn}>
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
