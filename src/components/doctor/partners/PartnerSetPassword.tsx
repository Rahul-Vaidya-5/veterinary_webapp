import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PartnerSetPassword.css';
import type { PartnerDoctor } from './PartnerDoctors';

type PartnerSetPasswordState = {
  partnerId?: string;
  mobileNumber?: string;
  fromForgot?: boolean;
};

const LS_PARTNERS = 'vc_partner_doctors';

const getPasswordChecks = (password: string) => ({
  hasMinLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[^A-Za-z0-9]/.test(password),
});

const loadPartners = (): PartnerDoctor[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_PARTNERS) ?? '[]');
  } catch {
    return [];
  }
};

function PartnerSetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as PartnerSetPasswordState | undefined) ?? {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const checks = getPasswordChecks(password);
  const isValidPassword = Object.values(checks).every(Boolean);

  const partner = useMemo(() => {
    const partners = loadPartners();
    if (state.partnerId) {
      return partners.find(item => item.id === state.partnerId) ?? null;
    }
    if (state.mobileNumber) {
      return (
        partners.find(item => item.mobileNumber === state.mobileNumber) ?? null
      );
    }
    return null;
  }, [state.mobileNumber, state.partnerId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!partner) {
      setError('Partner account not found.');
      return;
    }
    if (!isValidPassword) {
      setError(
        'Password must be 8+ characters and include uppercase, lowercase, number, and special character.',
      );
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    const partners = loadPartners();
    const updated = partners.map(item =>
      item.id === partner.id
        ? {
            ...item,
            password,
          }
        : item,
    );

    localStorage.setItem(LS_PARTNERS, JSON.stringify(updated));

    if (state.fromForgot) {
      navigate('/login', {
        replace: true,
        state: {
          loginRole: 'partner',
          mobileNumber: partner.mobileNumber,
          partnerId: partner.id,
        },
      });
      return;
    }

    localStorage.setItem(
      'vc_session_partner',
      JSON.stringify({
        partnerId: partner.id,
        mobileNumber: partner.mobileNumber,
      }),
    );

    navigate(`/partner/${partner.id}/dashboard/appointments`, {
      replace: true,
      state: {
        doctorName: partner.name,
        mobileNumber: partner.mobileNumber,
        partnerId: partner.id,
        partnerDoctor: {
          ...partner,
          password,
        },
      },
    });
  };

  if (!partner) {
    return (
      <section className="partner-set-password">
        <h2>Partner Password Setup</h2>
        <p>Partner details are missing. Please retry from login.</p>
      </section>
    );
  }

  return (
    <section className="partner-set-password">
      <h2>
        {state.fromForgot
          ? 'Reset Partner Password'
          : 'Create Partner Password'}
      </h2>
      <p>
        {state.fromForgot
          ? 'Set a new secure password for your partner account.'
          : 'First-time login detected. Create your personal credential now.'}
      </p>

      <form onSubmit={submit}>
        <label>
          New Password *
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 8 chars, include A-Z, a-z, 0-9, special char"
          />
        </label>

        <ul className="partner-password-rules">
          <li className={checks.hasMinLength ? 'ok' : ''}>
            Minimum 8 characters
          </li>
          <li className={checks.hasUppercase ? 'ok' : ''}>
            At least 1 uppercase letter
          </li>
          <li className={checks.hasLowercase ? 'ok' : ''}>
            At least 1 lowercase letter
          </li>
          <li className={checks.hasNumber ? 'ok' : ''}>At least 1 number</li>
          <li className={checks.hasSpecial ? 'ok' : ''}>
            At least 1 special character
          </li>
        </ul>

        <label>
          Confirm Password *
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && <p className="partner-password-error">{error}</p>}

        <button type="submit">Save Password</button>
      </form>
    </section>
  );
}

export default PartnerSetPassword;
