import { useState, type FormEvent } from 'react';
import './LoginForm.css';
interface LoginFormProps {
  mobileNumber: string;
  onGoBack: () => void;
}

function LoginForm({ mobileNumber, onGoBack }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);

    // Simulate login
    setTimeout(() => {
      alert(`Logged in with ${mobileNumber}`);
      setIsLoggingIn(false);
    }, 1000);
  }

  return (
    <div className="login-form">
      <button className="back-button" onClick={onGoBack}>
        ← Back
      </button>
      <h2>Welcome back!</h2>
      <p>Mobile: {mobileNumber}</p>

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
