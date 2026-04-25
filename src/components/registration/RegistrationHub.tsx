import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../utility/BackNavigation';
import './RegistrationHub.css';

const roles = [
  {
    icon: '🩺',
    emoji: '🐾',
    label: 'Veterinary Doctor',
    desc: 'Manage clinic, appointments, prescriptions & partner doctors',
    path: '/register/doctor',
    accent: '#00897b',
    bg: '#e0f2f1',
    border: '#80cbc4',
  },
  {
    icon: '🐾',
    emoji: '🐕',
    label: 'Pet Owner',
    desc: "Track your pet's health records, vaccinations & reminders",
    path: '/register/animal',
    accent: '#ff6b4a',
    bg: '#fff0ec',
    border: '#ffb39c',
  },
  {
    icon: '🛒',
    emoji: '🏪',
    label: 'Shop / Supplier',
    desc: 'Pet food, medical supplies & grooming product management',
    path: '/register/shop',
    accent: '#7c3aed',
    bg: '#f3eeff',
    border: '#c4b5fd',
  },
];

function RegistrationHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber =
    (location.state as { mobileNumber?: string } | undefined)?.mobileNumber ??
    '';

  return (
    <div className="reg-hub">
      <div className="reg-hub-header">
        <BackButton fallbackTo="/" />
        <div className="rhh-badge">
          <span role="img" aria-label="new">
            ✨
          </span>
          New to PetCare
        </div>
        <h2 className="rhh-title">Choose your role</h2>
        <p className="rhh-sub">
          Mobile <strong>{mobileNumber || 'unknown'}</strong> is not registered
          yet. Pick the role that best describes you to get started.
        </p>
      </div>

      <div className="reg-hub-cards">
        {roles.map((r, i) => (
          <button
            key={r.label}
            className="reg-role-card"
            onClick={() => navigate(r.path, { state: { mobileNumber } })}
            style={
              {
                '--card-accent': r.accent,
                '--card-bg': r.bg,
                '--card-border': r.border,
                animationDelay: `${i * 0.1}s`,
              } as React.CSSProperties
            }
          >
            <span className="rrc-emoji" role="img" aria-label={r.label}>
              {r.icon}
            </span>
            <div className="rrc-body">
              <strong className="rrc-label">{r.label}</strong>
              <p className="rrc-desc">{r.desc}</p>
            </div>
            <span className="rrc-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>

      <p className="reg-hub-footer">
        Already registered?{' '}
        <button
          className="rhf-link"
          onClick={() => navigate('/')}
          type="button"
        >
          Go back to home
        </button>
      </p>
    </div>
  );
}

export default RegistrationHub;
