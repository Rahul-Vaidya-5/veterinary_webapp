import { Link } from 'react-router-dom';
import './HomePage.css';

/* ════════════════════════════════════════
   SVG Pet Illustrations
════════════════════════════════════════ */

function DogFace() {
  return (
    <svg
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
      className="illo-dog"
      aria-label="Dog"
    >
      <ellipse
        cx="46"
        cy="78"
        rx="26"
        ry="42"
        fill="#c47c10"
        transform="rotate(-22 46 78)"
      />
      <ellipse
        cx="46"
        cy="80"
        rx="15"
        ry="28"
        fill="#e8961e"
        transform="rotate(-22 46 80)"
      />
      <ellipse
        cx="134"
        cy="78"
        rx="26"
        ry="42"
        fill="#c47c10"
        transform="rotate(22 134 78)"
      />
      <ellipse
        cx="134"
        cy="80"
        rx="15"
        ry="28"
        fill="#e8961e"
        transform="rotate(22 134 80)"
      />
      <circle cx="90" cy="102" r="58" fill="#f4a82a" />
      <ellipse cx="90" cy="80" rx="42" ry="22" fill="#d68c18" />
      <ellipse cx="90" cy="125" rx="32" ry="23" fill="#ffd070" />
      <circle cx="68" cy="96" r="12" fill="white" />
      <circle cx="112" cy="96" r="12" fill="white" />
      <circle cx="70" cy="95" r="7.5" fill="#1c0c04" />
      <circle cx="114" cy="95" r="7.5" fill="#1c0c04" />
      <circle cx="72" cy="93" r="3" fill="white" />
      <circle cx="116" cy="93" r="3" fill="white" />
      <ellipse cx="90" cy="117" rx="11" ry="7.5" fill="#111" />
      <ellipse cx="87" cy="115" rx="3.5" ry="2" fill="rgba(255,255,255,0.25)" />
      <path
        d="M80 126 Q90 133 100 126"
        stroke="#b07010"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M78 134 Q78 150 90 152 Q102 150 102 134 Z" fill="#e8507a" />
      <line
        x1="90"
        y1="134"
        x2="90"
        y2="152"
        stroke="#b83055"
        strokeWidth="1.8"
      />
      <path
        d="M57 85 Q69 79 81 85"
        stroke="#a06010"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M99 85 Q111 79 123 85"
        stroke="#a06010"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="110" rx="10" ry="6" fill="rgba(255,130,60,0.18)" />
      <ellipse cx="130" cy="110" rx="10" ry="6" fill="rgba(255,130,60,0.18)" />
    </svg>
  );
}

function CatFace() {
  return (
    <svg
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
      className="illo-cat"
      aria-label="Cat"
    >
      <polygon points="44,88 26,34 76,70" fill="#ff7043" />
      <polygon points="46,84 38,48 72,68" fill="#ffccbc" />
      <polygon points="136,88 154,34 104,70" fill="#ff7043" />
      <polygon points="134,84 142,48 108,68" fill="#ffccbc" />
      <circle cx="90" cy="108" r="57" fill="#ff8a65" />
      <ellipse cx="90" cy="124" rx="38" ry="28" fill="#ffa580" />
      <ellipse cx="66" cy="102" rx="13" ry="10" fill="#b2dfdb" />
      <ellipse cx="114" cy="102" rx="13" ry="10" fill="#b2dfdb" />
      <ellipse cx="66" cy="102" rx="5" ry="9.5" fill="#1a0820" />
      <ellipse cx="114" cy="102" rx="5" ry="9.5" fill="#1a0820" />
      <circle cx="64" cy="99" r="2.2" fill="white" />
      <circle cx="112" cy="99" r="2.2" fill="white" />
      <polygon points="90,118 83,125 97,125" fill="#e91e63" />
      <path
        d="M83 125 Q78 132 68 130"
        stroke="#c2185b"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M97 125 Q102 132 112 130"
        stroke="#c2185b"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="116"
        x2="80"
        y2="120"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="123"
        x2="80"
        y2="123"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="130"
        x2="80"
        y2="126"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="158"
        y1="116"
        x2="100"
        y2="120"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="158"
        y1="123"
        x2="100"
        y2="123"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="158"
        y1="130"
        x2="100"
        y2="126"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M78 82 Q88 73 98 82"
        stroke="#d84315"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M82 76 Q90 70 98 76"
        stroke="#d84315"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="114" rx="10" ry="6" fill="rgba(255,160,100,0.22)" />
      <ellipse cx="130" cy="114" rx="10" ry="6" fill="rgba(255,160,100,0.22)" />
    </svg>
  );
}

/* ════════════════════════════════════════
   Data
════════════════════════════════════════ */

const roles = [
  { icon: '🩺', label: 'Veterinary Doctors', color: 'role-vet' },
  { icon: '🐾', label: 'Pet Owners', color: 'role-owner' },
  { icon: '🛒', label: 'Pet Food Suppliers', color: 'role-food' },
  { icon: '💊', label: 'Medical Suppliers', color: 'role-med' },
  { icon: '✂️', label: 'Pet Groomers', color: 'role-groom' },
  { icon: '🏠', label: 'Shelter Houses', color: 'role-shelter' },
];

const services = [
  {
    icon: '💉',
    title: 'Vaccination Records',
    desc: 'Complete immunization history with automatic reminders for boosters and deworming.',
    accent: '#4caf50',
  },
  {
    icon: '📋',
    title: 'Medical History',
    desc: 'Prescriptions, diagnoses, and visit notes stored securely and accessible anytime.',
    accent: '#2196f3',
  },
  {
    icon: '🛒',
    title: 'Supply Management',
    desc: 'Track pet food and medical inventory for suppliers and clinics in one unified dashboard.',
    accent: '#ff9800',
  },
  {
    icon: '✂️',
    title: 'Grooming Schedules',
    desc: 'Book, track, and manage grooming appointments for every breed and coat type.',
    accent: '#e91e63',
  },
  {
    icon: '🏠',
    title: 'Shelter Registry',
    desc: 'Maintain pet shelter records, adoptions, and health statuses for every resident animal.',
    accent: '#9c27b0',
  },
  {
    icon: '📊',
    title: 'Reports & Analytics',
    desc: 'Business insights for clinics, suppliers, and groomers — expenses, trends, and more.',
    accent: '#00bcd4',
  },
];

const petTypes = [
  { emoji: '🐕', name: 'Dogs' },
  { emoji: '🐈', name: 'Cats' },
  { emoji: '🐇', name: 'Rabbits' },
  { emoji: '🐦', name: 'Birds' },
  { emoji: '🐠', name: 'Fish' },
  { emoji: '🐹', name: 'Hamsters' },
];

/* ════════════════════════════════════════
   Component
════════════════════════════════════════ */

function HomePage() {
  return (
    <main className="hp-root">
      {/* Animated background */}
      <div className="hp-bg-anim" aria-hidden="true">
        <div className="hp-orb hp-orb-1" />
        <div className="hp-orb hp-orb-2" />
        <div className="hp-orb hp-orb-3" />
        <span className="hp-float-paw p1">🐾</span>
        <span className="hp-float-paw p2">🐾</span>
        <span className="hp-float-paw p3">🐾</span>
        <span className="hp-float-paw p4">🐾</span>
        <span className="hp-float-paw p5">🐾</span>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="hp-hero">
        <div className="hp-hero-text">
          <span className="hp-eyebrow">🌟 The Complete Pet Care Ecosystem</span>
          <h1 className="hp-h1">
            One platform for <span className="hp-h1-grad">every pet</span>
            <br />& everyone who{' '}
            <span className="hp-h1-grad">cares for them</span>
          </h1>
          <p className="hp-hero-desc">
            Connecting pet owners, veterinarians, groomers, shelters, food &amp;
            medical suppliers — all in one seamless ecosystem built around your
            pet&apos;s health and happiness.
          </p>
          <div className="hp-hero-actions">
            <Link className="hp-btn-primary" to="/entry">
              Get Started
              <span aria-hidden="true" className="hp-btn-arrow">
                →
              </span>
            </Link>
            <p className="hp-hero-hint">Enter your mobile number to begin</p>
          </div>
          {/* Role pills */}
          <div className="hp-role-pills" aria-label="Platform members">
            {roles.map(r => (
              <span key={r.label} className={`hp-role-pill ${r.color}`}>
                <span className="rp-icon" role="img" aria-label={r.label}>
                  {r.icon}
                </span>
                {r.label}
              </span>
            ))}
          </div>
        </div>

        <div className="hp-hero-visual" aria-hidden="true">
          <div className="hp-pet-stage">
            <div className="hp-stage-glow" />
            <div className="hp-dog-card">
              <DogFace />
              <p className="hp-pet-label">Dogs & Puppies</p>
            </div>
            <div className="hp-cat-card">
              <CatFace />
              <p className="hp-pet-label">Cats & Kittens</p>
            </div>
            <div className="hp-stage-badge hb-1">✓ Vaccinated</div>
            <div className="hp-stage-badge hb-2">🩺 Vet Ready</div>
            <div className="hp-stage-badge hb-3">💊 Stocked</div>
          </div>
        </div>
      </section>

      {/* ═══ PET TYPES STRIP ═══ */}
      <section className="hp-pets-strip">
        <p className="hp-strip-label">We care for all kinds of pets</p>
        <div className="hp-pets-row">
          {petTypes.map(p => (
            <div className="hp-pet-chip" key={p.name}>
              <span role="img" aria-label={p.name} className="hpc-emoji">
                {p.emoji}
              </span>
              <span className="hpc-name">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="hp-services">
        <div className="hp-section-head">
          <p className="hp-section-label">Platform Features</p>
          <h2 className="hp-section-h2">Everything the pet world needs</h2>
          <p className="hp-section-sub">
            A complete suite of tools for every professional and pet family — no
            multiple apps, no lost records.
          </p>
        </div>
        <div className="hp-services-grid">
          {services.map((s, i) => (
            <article
              className="hp-svc-card"
              key={s.title}
              style={
                {
                  '--accent': s.accent,
                  animationDelay: `${i * 0.1}s`,
                } as React.CSSProperties
              }
            >
              <span className="svc-icon" role="img" aria-label={s.title}>
                {s.icon}
              </span>
              <h3 className="svc-title">{s.title}</h3>
              <p className="svc-desc">{s.desc}</p>
              <span className="svc-bar" />
            </article>
          ))}
        </div>
      </section>

      {/* ═══ WHO IS IT FOR ═══ */}
      <section className="hp-for-section">
        <div className="hp-section-head">
          <p className="hp-section-label">Who uses PetCare?</p>
          <h2 className="hp-section-h2">Built for the whole pet ecosystem</h2>
        </div>
        <div className="hp-for-grid">
          <div className="hp-for-card fc-vet">
            <span className="for-icon">🩺</span>
            <h3>Veterinary Clinics</h3>
            <ul>
              <li>Manage appointments & consultations</li>
              <li>Prescriptions and medical history</li>
              <li>Partner doctor management</li>
              <li>Expense and income tracking</li>
            </ul>
          </div>
          <div className="hp-for-card fc-owner">
            <span className="for-icon">🐾</span>
            <h3>Pet Owners</h3>
            <ul>
              <li>Track pet health records</li>
              <li>Vaccination reminders</li>
              <li>Find trusted clinics nearby</li>
              <li>Grooming bookings</li>
            </ul>
          </div>
          <div className="hp-for-card fc-supplier">
            <span className="for-icon">🛒</span>
            <h3>Food & Medical Suppliers</h3>
            <ul>
              <li>Inventory management</li>
              <li>Supply chain tracking</li>
              <li>Connect with clinics</li>
              <li>Sales analytics</li>
            </ul>
          </div>
          <div className="hp-for-card fc-groom">
            <span className="for-icon">✂️</span>
            <h3>Groomers & Shelters</h3>
            <ul>
              <li>Appointment scheduling</li>
              <li>Pet profile management</li>
              <li>Shelter adoption records</li>
              <li>Health status tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ ACTIVITY BANNER ═══ */}
      <section className="hp-activity-banner">
        <div className="hp-ab-inner">
          <div className="hp-ab-anim-pets" aria-hidden="true">
            <span className="ab-pet ab-dog">🐶</span>
            <span className="ab-pet ab-cat">🐱</span>
            <span className="ab-pet ab-rabbit">🐰</span>
            <span className="ab-pet ab-bird">🦜</span>
          </div>
          <div className="hp-ab-text">
            <h2>Every pet activity. One place.</h2>
            <p>
              From routine check-ups to emergency care, from grooming sessions
              to shelter adoptions — PetCare brings it all together.
            </p>
            <Link className="hp-btn-primary hp-btn-white" to="/entry">
              Join PetCare Today
              <span aria-hidden="true" className="hp-btn-arrow">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
