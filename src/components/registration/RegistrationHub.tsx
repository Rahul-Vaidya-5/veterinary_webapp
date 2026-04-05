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
        Mobile number {mobileNumber || 'Not provided'} is not registered with
        us.
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
        <button onClick={() => alert('Animal Owner registration')}>
          Register as Animal Owner
        </button>
        <button onClick={() => alert('Shop registration')}>
          Register as Shop Owner
        </button>
      </div>
    </div>
  );
}

export default RegistrationHub;
