import { Outlet } from 'react-router-dom';
import '../App.css';

const brandFeatures = [
  { icon: '💉', text: 'Vaccination tracking & reminders' },
  { icon: '📋', text: 'Complete pet health records' },
  { icon: '🏥', text: 'Trusted vet clinic network' },
  { icon: '✂️', text: 'Grooming & shelter management' },
];

const floatingPets = [
  {
    emoji: '🐕',
    style: {
      top: '8%',
      left: '12%',
      animationDelay: '0s',
      animationDuration: '6s',
      fontSize: '2.4rem',
    },
  },
  {
    emoji: '🐈',
    style: {
      top: '18%',
      right: '10%',
      animationDelay: '-2s',
      animationDuration: '7s',
      fontSize: '2rem',
    },
  },
  {
    emoji: '🐾',
    style: {
      top: '42%',
      left: '6%',
      animationDelay: '-4s',
      animationDuration: '5s',
      fontSize: '1.4rem',
      opacity: 0.45,
    },
  },
  {
    emoji: '🐇',
    style: {
      bottom: '28%',
      right: '8%',
      animationDelay: '-1s',
      animationDuration: '8s',
      fontSize: '1.8rem',
    },
  },
  {
    emoji: '🐄',
    style: {
      bottom: '36%',
      left: '12%',
      animationDelay: '-2.5s',
      animationDuration: '8.4s',
      fontSize: '2rem',
    },
  },
  {
    emoji: '🐾',
    style: {
      bottom: '14%',
      left: '18%',
      animationDelay: '-3s',
      animationDuration: '6.5s',
      fontSize: '1.2rem',
      opacity: 0.35,
    },
  },
  {
    emoji: '🦜',
    style: {
      top: '60%',
      right: '14%',
      animationDelay: '-5s',
      animationDuration: '7.5s',
      fontSize: '1.6rem',
    },
  },
];

function AppShellLayout() {
  return (
    <div className="app-shell">
      {/* ── Left brand panel ── */}
      <aside className="shell-brand-panel" aria-hidden="true">
        <div className="sbp-orb sbp-orb-1" />
        <div className="sbp-orb sbp-orb-2" />

        {floatingPets.map((p, i) => (
          <span
            key={i}
            className="sbp-float-pet"
            style={p.style as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}

        <div className="sbp-content">
          <div className="sbp-logo">
            <span className="sbp-logo-icon">🐾</span>
            <span className="sbp-logo-text">PetCare</span>
          </div>

          <div className="sbp-pet-duo">
            {/* Dog face SVG */}
            <div className="sbp-pet-card">
              <svg
                viewBox="0 0 120 120"
                className="sbp-pet-svg"
                aria-label="Dog"
              >
                <ellipse
                  cx="30"
                  cy="52"
                  rx="18"
                  ry="28"
                  fill="#c47c10"
                  transform="rotate(-22 30 52)"
                />
                <ellipse
                  cx="90"
                  cy="52"
                  rx="18"
                  ry="28"
                  fill="#c47c10"
                  transform="rotate(22 90 52)"
                />
                <circle cx="60" cy="68" r="38" fill="#f4a82a" />
                <ellipse cx="60" cy="52" rx="28" ry="15" fill="#d68c18" />
                <ellipse cx="60" cy="82" rx="22" ry="16" fill="#ffd070" />
                <circle cx="44" cy="63" r="8" fill="white" />
                <circle cx="76" cy="63" r="8" fill="white" />
                <circle cx="46" cy="62" r="5" fill="#111" />
                <circle cx="78" cy="62" r="5" fill="#111" />
                <circle cx="47" cy="60" r="2" fill="white" />
                <circle cx="79" cy="60" r="2" fill="white" />
                <ellipse cx="60" cy="76" rx="7" ry="5" fill="#111" />
                <path
                  d="M52 85 Q60 90 68 85"
                  stroke="#b07010"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <p>Dogs</p>
            </div>
            {/* Cat face SVG */}
            <div className="sbp-pet-card">
              <svg
                viewBox="0 0 120 120"
                className="sbp-pet-svg"
                aria-label="Cat"
              >
                <polygon points="29,58 18,22 50,46" fill="#ff7043" />
                <polygon points="91,58 102,22 70,46" fill="#ff7043" />
                <circle cx="60" cy="72" r="38" fill="#ff8a65" />
                <ellipse cx="60" cy="84" rx="26" ry="19" fill="#ffa580" />
                <ellipse cx="44" cy="67" r="9" fill="#b2dfdb" />
                <ellipse cx="76" cy="67" r="9" fill="#b2dfdb" />
                <ellipse cx="44" cy="67" rx="3.5" ry="8" fill="#1a0820" />
                <ellipse cx="76" cy="67" rx="3.5" ry="8" fill="#1a0820" />
                <circle cx="43" cy="65" r="1.5" fill="white" />
                <circle cx="75" cy="65" r="1.5" fill="white" />
                <polygon points="60,78 55,83 65,83" fill="#e91e63" />
                <line
                  x1="14"
                  y1="76"
                  x2="52"
                  y2="79"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="14"
                  y1="81"
                  x2="52"
                  y2="81"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="106"
                  y1="76"
                  x2="68"
                  y2="79"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <line
                  x1="106"
                  y1="81"
                  x2="68"
                  y2="81"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
              <p>Cats</p>
            </div>

            <div className="sbp-pet-card">
              <svg
                viewBox="0 0 120 120"
                className="sbp-pet-svg"
                aria-label="Cattle"
              >
                <ellipse cx="60" cy="70" rx="38" ry="30" fill="#f5f5f5" />
                <ellipse cx="36" cy="55" rx="12" ry="8" fill="#9e9e9e" />
                <ellipse cx="84" cy="60" rx="11" ry="7" fill="#9e9e9e" />
                <ellipse
                  cx="22"
                  cy="52"
                  rx="10"
                  ry="6"
                  fill="#d4a373"
                  transform="rotate(-18 22 52)"
                />
                <ellipse
                  cx="98"
                  cy="52"
                  rx="10"
                  ry="6"
                  fill="#d4a373"
                  transform="rotate(18 98 52)"
                />
                <ellipse cx="60" cy="86" rx="26" ry="16" fill="#ffd6a5" />
                <circle cx="46" cy="68" r="7" fill="white" />
                <circle cx="74" cy="68" r="7" fill="white" />
                <circle cx="47" cy="68" r="4" fill="#111" />
                <circle cx="75" cy="68" r="4" fill="#111" />
                <ellipse cx="52" cy="86" rx="4" ry="3" fill="#8d6e63" />
                <ellipse cx="68" cy="86" rx="4" ry="3" fill="#8d6e63" />
              </svg>
              <p>Cattles</p>
            </div>
          </div>

          <h2 className="sbp-headline">Your complete pet care ecosystem</h2>

          <ul className="sbp-features">
            {brandFeatures.map(f => (
              <li key={f.text}>
                <span className="sbpf-icon" role="img">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <section className="shell-form-panel">
        <Outlet />
      </section>
    </div>
  );
}

export default AppShellLayout;
