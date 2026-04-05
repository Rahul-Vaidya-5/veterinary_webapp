import { useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, Stethoscope, Store, ChevronRight } from 'lucide-react';
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
          <span className="option-left">
            <Stethoscope size={18} />
            <span>Register as Doctor</span>
          </span>
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() =>
            navigate('/register/animal', { state: { mobileNumber } })
          }
        >
          <span className="option-left">
            <PawPrint size={18} />
            <span>Register as Animal Owner</span>
          </span>
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() =>
            navigate('/register/shop', { state: { mobileNumber } })
          }
        >
          <span className="option-left">
            <Store size={18} />
            <span>Register as Shop Owner</span>
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default RegistrationHub;
