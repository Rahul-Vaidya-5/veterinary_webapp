import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../utility/BackNavigation';
import type { PartnerDoctor } from '../doctor/partners/PartnerDoctors';
import './ForgotPassword.css';

type Role = 'doctor' | 'partner';

type ForgotPasswordState = {
  loginRole?: Role;
  mobileNumber?: string;
  partnerId?: string;
};

type DoctorCredentialsStore = Record<string, string>;

const LS_PARTNERS = 'vc_partner_doctors';
const LS_DOCTOR_CREDENTIALS = 'vc_doctor_credentials';

const loadPartners = (): PartnerDoctor[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_PARTNERS) ?? '[]');
  } catch {
    return [];
  }
};

const loadDoctorCredentials = (): DoctorCredentialsStore => {
  try {
    return JSON.parse(localStorage.getItem(LS_DOCTOR_CREDENTIALS) ?? '{}');
  } catch {
    return {};
  }
};

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ForgotPasswordState | undefined) ?? {};

  const [role, setRole] = useState<Role>(state.loginRole ?? 'doctor');
  const [mobileNumber, setMobileNumber] = useState(state.mobileNumber ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const partnerMatch = useMemo(() => {
    if (role !== 'partner') return null;
    return loadPartners().find(
      partner =>
        partner.mobileNumber === mobileNumber &&
        (!state.partnerId || partner.id === state.partnerId),
    );
  }, [mobileNumber, role, state.partnerId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password should be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'doctor') {
      const creds = loadDoctorCredentials();
      creds[mobileNumber] = newPassword;
      localStorage.setItem(LS_DOCTOR_CREDENTIALS, JSON.stringify(creds));
      setSuccess('Doctor password reset successfully.');
      return;
    }

    if (!partnerMatch) {
      setError('Partner doctor account not found for this mobile number.');
      return;
    }

    navigate('/partner/set-password', {
      replace: true,
      state: {
        partnerId: partnerMatch.id,
        mobileNumber,
        fromForgot: true,
      },
    });
  };

  return (
    <section className="forgot-password">
      <BackButton fallbackTo="/login" />
      <h2>Forgot Password</h2>
      <p>Reset credentials for doctor or partner doctor account.</p>

      <form onSubmit={submit}>
        <label>
          Account Type
          <select
            value={role}
            onChange={e => setRole(e.target.value as Role)}
            disabled={Boolean(state.loginRole)}
          >
            <option value="doctor">Doctor</option>
            <option value="partner">Partner Doctor</option>
          </select>
        </label>

        <label>
          Mobile Number
          <input
            value={mobileNumber}
            onChange={e =>
              setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
            }
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && <p className="forgot-error">{error}</p>}
        {success && <p className="forgot-success">{success}</p>}

        <button type="submit">
          {role === 'partner' ? 'Continue To Partner Reset' : 'Reset Password'}
        </button>

        {role === 'doctor' && success && (
          <button
            type="button"
            className="forgot-back-btn"
            onClick={() =>
              navigate('/login', {
                replace: true,
                state: {
                  mobileNumber,
                  loginRole: 'doctor',
                },
              })
            }
          >
            Back To Login
          </button>
        )}
      </form>
    </section>
  );
}

export default ForgotPassword;
