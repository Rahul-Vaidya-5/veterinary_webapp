import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DoctorSetPassword.css';

type DoctorSetPasswordState = {
  doctorName?: string;
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

function DoctorSetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as DoctorSetPasswordState | undefined) ?? {};

  const doctorName = state.doctorName ?? 'Doctor';
  const mobileNumber = state.mobileNumber ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

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

    navigate('/doctor/home', {
      replace: true,
      state: {
        doctorName,
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
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 8 chars, include A-Z, a-z, 0-9, special char"
          />
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
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && <p className="set-password-error">{error}</p>}

        <div className="set-password-actions">
          <button type="submit">Save Password And Continue</button>
        </div>
      </form>
    </section>
  );
}

export default DoctorSetPassword;
