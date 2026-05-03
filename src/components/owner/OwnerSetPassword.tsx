import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../doctor/DoctorSetPassword.css';

type OwnerSetPasswordState = {
  ownerName?: string;
  mobileNumber?: string;
};

type PasswordStrength = 'weak' | 'moderate' | 'strong';

function getPasswordChecks(password: string) {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'moderate';
  return 'strong';
}

function OwnerSetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as OwnerSetPasswordState | undefined) ?? {};

  const ownerName = state.ownerName ?? 'Owner';
  const mobileNumber = state.mobileNumber ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checks = getPasswordChecks(password);
  const isPasswordValid = Object.values(checks).every(Boolean);
  const passwordStrength = getPasswordStrength(password);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (!isPasswordValid) {
      setError(
        'Password must be 8+ characters and include uppercase, lowercase, number, and special character.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setError('');

    // Persist credentials
    if (mobileNumber) {
      const creds: Record<string, string> = JSON.parse(
        localStorage.getItem('vc_owner_credentials') ?? '{}',
      );
      creds[mobileNumber] = password;
      localStorage.setItem('vc_owner_credentials', JSON.stringify(creds));
    }
    localStorage.setItem('vc_owner_name', ownerName);
    localStorage.setItem('vc_owner_mobile', mobileNumber);

    navigate('/owner/dashboard', {
      replace: true,
      state: {
        ownerName,
        mobileNumber,
      },
    });
  }

  return (
    <section className="doctor-set-password">
      <h2>Set Your Password</h2>
      <p>Create your account password to continue.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Create Password *
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, include A-Z, a-z, 0-9, special char"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>

        <div className="password-helper">
          <p className="password-rules-title">Password rules:</p>
          <ul className="password-rules-list">
            <li className={checks.hasMinLength ? 'rule-met' : 'rule-pending'}>
              Minimum 8 characters
            </li>
            <li className={checks.hasUppercase ? 'rule-met' : 'rule-pending'}>
              At least 1 uppercase letter (A-Z)
            </li>
            <li className={checks.hasLowercase ? 'rule-met' : 'rule-pending'}>
              At least 1 lowercase letter (a-z)
            </li>
            <li className={checks.hasNumber ? 'rule-met' : 'rule-pending'}>
              At least 1 number (0-9)
            </li>
            <li className={checks.hasSpecial ? 'rule-met' : 'rule-pending'}>
              At least 1 special character
            </li>
          </ul>

          {password && (
            <p
              className={`password-strength password-strength-${passwordStrength}`}
            >
              Password strength:{' '}
              {passwordStrength === 'weak'
                ? 'Weak'
                : passwordStrength === 'moderate'
                  ? 'Moderate'
                  : 'Strong'}
            </p>
          )}
        </div>

        <label>
          Confirm Password *
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(v => !v)}
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {error && <p className="set-password-error">{error}</p>}

        <div className="set-password-actions">
          <button type="submit">Save Password And Continue</button>
        </div>
      </form>
    </section>
  );
}

export default OwnerSetPassword;
