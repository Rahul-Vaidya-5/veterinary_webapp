import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../utility/BackNavigation';
import './RegistrationHub.css';

function RegistrationHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber =
    (location.state as { mobileNumber?: string } | undefined)?.mobileNumber ??
    '';

  return (
    <div className="registration-prompt">
      <BackButton fallbackTo="/" />

      <h2>Not registered yet</h2>
      <p>
        Mobile number <strong>{mobileNumber || 'Not provided'}</strong> is not
        registered with us.
      </p>
      <p>Please choose your registration type:</p>

      <div className="registration-options">
        <button
          onClick={() =>
            navigate('/register/doctor', { state: { mobileNumber } })
          }
        >
          Register as Doctor
        </button>
        <button
          onClick={() =>
            navigate('/register/animal', { state: { mobileNumber } })
          }
        >
          Register as Animal Owner
        </button>
        <button
          onClick={() =>
            navigate('/register/shop', { state: { mobileNumber } })
          }
        >
          Register as Shop Owner
        </button>
      </div>
    </div>
  );
}

export default RegistrationHub;
