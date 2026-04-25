import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../utility/BackNavigation';
import './LoginForm.css';

type PartnerDoctor = {
  id: string;
  name: string;
  mobileNumber: string;
  password?: string;
  isActive?: boolean;
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

function LoginForm() {
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const loginState =
    (location.state as
      | {
          mobileNumber?: string;
          loginRole?: 'doctor' | 'partner';
          partnerId?: string;
        }
      | undefined) ?? {};
  const mobileNumber = loginState.mobileNumber ?? '';

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setError('');

    setTimeout(() => {
      if (loginState.loginRole === 'partner') {
        const partner = loadPartners().find(
          item =>
            item.id === loginState.partnerId &&
            item.mobileNumber === mobileNumber,
        );

        if (!partner) {
          setError('Invalid partner login credentials.');
          setIsLoggingIn(false);
          return;
        }

        if (partner.isActive === false) {
          setError(
            'Your account is deactivated by parent doctor. Please contact clinic owner.',
          );
          setIsLoggingIn(false);
          return;
        }

        if (!partner.password) {
          setIsLoggingIn(false);
          navigate('/partner/set-password', {
            replace: true,
            state: {
              partnerId: partner.id,
              mobileNumber: partner.mobileNumber,
            },
          });
          return;
        }

        if (partner.password !== password) {
          setError('Invalid partner login credentials.');
          setIsLoggingIn(false);
          return;
        }

        localStorage.setItem(
          'vc_session_partner',
          JSON.stringify({
            partnerId: partner.id,
            mobileNumber: partner.mobileNumber,
          }),
        );
        setIsLoggingIn(false);
        navigate(`/partner/${partner.id}/dashboard/appointments`, {
          replace: true,
          state: {
            doctorName: partner.name,
            mobileNumber: partner.mobileNumber,
            partnerId: partner.id,
            partnerDoctor: partner,
          },
        });
        return;
      }

      const doctorCredentials = loadDoctorCredentials();
      const expectedPassword = doctorCredentials[mobileNumber];

      if (expectedPassword && expectedPassword !== password) {
        setError('Invalid doctor login credentials.');
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem(
        'vc_session_doctor',
        JSON.stringify({ mobileNumber }),
      );
      setIsLoggingIn(false);
      navigate('/doctor/dashboard/overview', {
        replace: true,
        state: {
          doctorName: 'Doctor',
          mobileNumber,
        },
      });
    }, 1000);
  }

  return (
    <div className="login-form">
      <BackButton fallbackTo="/" />

      <h2>Welcome back!</h2>
      <p>Mobile: {mobileNumber || 'Not provided'}</p>
      {loginState.loginRole === 'partner' && <p>Partner doctor login</p>}

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
        {error && <p className="login-error-text">{error}</p>}
        <button
          type="button"
          className="login-forgot-btn"
          onClick={() =>
            navigate('/forgot-password', {
              state: {
                loginRole: loginState.loginRole ?? 'doctor',
                mobileNumber,
                partnerId: loginState.partnerId,
              },
            })
          }
        >
          Forgot Password?
        </button>
        <button type="submit" className="login-button" disabled={isLoggingIn}>
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
