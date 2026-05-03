import { createContext, useContext, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  PawPrint,
  Calendar,
  Heart,
  Home,
  Users,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  TrendingUp,
} from 'lucide-react';
import './OwnerDashboard.css';

export type OwnerInfo = {
  ownerName: string;
  mobileNumber: string;
};

export const OwnerContext = createContext<OwnerInfo>({
  ownerName: 'Owner',
  mobileNumber: '',
});
export const useOwnerInfo = () => useContext(OwnerContext);

function DashPawPrint() {
  return (
    <svg viewBox="0 0 70 80" className="sidebar-pet-svg" aria-label="Paw">
      <ellipse cx="35" cy="54" rx="18" ry="13" fill="#f59e0b" />
      <ellipse
        cx="18"
        cy="42"
        rx="7"
        ry="5"
        fill="#d97706"
        transform="rotate(-20 18 42)"
      />
      <ellipse
        cx="52"
        cy="42"
        rx="7"
        ry="5"
        fill="#d97706"
        transform="rotate(20 52 42)"
      />
      <ellipse
        cx="25"
        cy="34"
        rx="6"
        ry="4.5"
        fill="#d97706"
        transform="rotate(-10 25 34)"
      />
      <ellipse
        cx="45"
        cy="34"
        rx="6"
        ry="4.5"
        fill="#d97706"
        transform="rotate(10 45 34)"
      />
      <ellipse cx="35" cy="32" rx="5" ry="4" fill="#d97706" />
      <circle cx="28" cy="54" r="3" fill="#fff" opacity="0.35" />
    </svg>
  );
}

function DashDogFace() {
  return (
    <svg viewBox="0 0 70 80" className="sidebar-pet-svg" aria-label="Dog">
      <ellipse cx="33" cy="55" rx="18" ry="11" fill="#f59e0b" />
      <circle cx="33" cy="28" r="16" fill="#f59e0b" />
      <ellipse
        cx="19"
        cy="17"
        rx="7"
        ry="10"
        fill="#d97706"
        transform="rotate(-15 19 17)"
      />
      <ellipse
        cx="47"
        cy="17"
        rx="7"
        ry="10"
        fill="#d97706"
        transform="rotate(15 47 17)"
      />
      <circle cx="28" cy="25" r="3.5" fill="#1a1a2e" />
      <circle cx="38" cy="25" r="3.5" fill="#1a1a2e" />
      <circle cx="29" cy="24" r="1" fill="white" />
      <circle cx="39" cy="24" r="1" fill="white" />
      <ellipse cx="33" cy="34" rx="7" ry="5" fill="#e07b00" />
      <ellipse cx="33" cy="36" rx="4" ry="3" fill="#1a1a2e" />
      <rect
        className="dog-tail-o"
        x="50"
        y="43"
        width="5"
        height="14"
        rx="2.5"
        fill="#d97706"
      />
      <rect x="26" y="65" width="6" height="10" rx="3" fill="#d97706" />
      <rect x="35" y="65" width="6" height="10" rx="3" fill="#d97706" />
    </svg>
  );
}

function DashCatFace() {
  return (
    <svg viewBox="0 0 70 80" className="sidebar-pet-svg" aria-label="Cat">
      <ellipse cx="33" cy="55" rx="17" ry="11" fill="#fb923c" />
      <circle cx="33" cy="27" r="15" fill="#fb923c" />
      <polygon points="18,14 13,2 24,10" fill="#e05a00" />
      <polygon points="48,14 57,2 46,10" fill="#e05a00" />
      <ellipse cx="27" cy="25" rx="4" ry="5" fill="#1a1a2e" />
      <ellipse cx="39" cy="25" rx="4" ry="5" fill="#1a1a2e" />
      <circle cx="28" cy="24" r="1.2" fill="white" />
      <circle cx="40" cy="24" r="1.2" fill="white" />
      <ellipse cx="33" cy="33" rx="5" ry="3.5" fill="#e05a00" />
      <circle cx="33" cy="34.5" rx="3" ry="2.5" fill="#1a1a2e" />
      <line
        x1="20"
        y1="31"
        x2="10"
        y2="29"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="33"
        x2="9"
        y2="33"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="31"
        x2="56"
        y2="29"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="33"
        x2="57"
        y2="33"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        className="cat-tail-o"
        d="M50 60 Q62 50 60 40"
        stroke="#e05a00"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OwnerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as Partial<OwnerInfo> | undefined) ?? {};

  const ownerInfo: OwnerInfo = {
    ownerName:
      state.ownerName ?? localStorage.getItem('vc_owner_name') ?? 'Owner',
    mobileNumber:
      state.mobileNumber ?? localStorage.getItem('vc_owner_mobile') ?? '',
  };

  if (state.ownerName) localStorage.setItem('vc_owner_name', state.ownerName);
  if (state.mobileNumber)
    localStorage.setItem('vc_owner_mobile', state.mobileNumber);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (id: string) =>
    setExpandedSection(prev => (prev === id ? null : id));

  const handleLogout = () => {
    localStorage.removeItem('vc_owner_name');
    localStorage.removeItem('vc_owner_mobile');
    navigate('/', { replace: true });
  };

  const sidebarSections = [
    {
      id: 'shelter',
      label: 'Shelter Home',
      icon: <Home size={16} />,
      items: [
        { label: 'Find Shelter', path: 'shelter' },
        { label: 'My Stay Requests', path: 'shelter/my-requests' },
      ],
    },
    {
      id: 'connect',
      label: 'Pet Connect',
      icon: <Users size={16} />,
      items: [
        { label: 'Find Match', path: 'connect' },
        { label: 'My Requests', path: 'connect/my-requests' },
      ],
    },
  ];

  const topNavItems = [
    { label: 'Overview', path: 'overview', icon: <PawPrint size={16} /> },
    {
      label: 'Appointment',
      path: 'appointments',
      icon: <Calendar size={16} />,
    },
    { label: 'Health', path: 'health', icon: <Heart size={16} /> },
    { label: 'Growth', path: 'growth', icon: <TrendingUp size={16} /> },
  ];

  const floatingPets = [
    { emoji: '🐕', delay: '0s', dur: '6s' },
    { emoji: '🐈', delay: '-2.2s', dur: '7.4s' },
    { emoji: '🐾', delay: '-4s', dur: '5.2s' },
  ];

  return (
    <OwnerContext.Provider value={ownerInfo}>
      <div
        className={`owner-dashboard${sidebarOpen ? '' : ' sidebar-collapsed'}`}
      >
        {/* ── Sidebar ── */}
        <aside className="owner-sidebar">
          <div className="owner-sidebar-logo">
            <PawPrint size={22} />
            <span>PetCare</span>
          </div>

          <section
            className="owner-identity-card"
            aria-label="Owner profile summary"
          >
            <div className="owner-identity-avatar">
              <User size={18} />
            </div>
            <div className="owner-identity-copy">
              <h2>{ownerInfo.ownerName}</h2>
              <p className="owner-identity-role">Pet Owner</p>
            </div>
          </section>

          <nav className="owner-sidebar-nav">
            {sidebarSections.map(section => (
              <div key={section.id} className="owner-sidebar-section">
                <button
                  className={`owner-sidebar-section-header${expandedSection === section.id ? ' expanded' : ''}`}
                  onClick={() => toggleSection(section.id)}
                  type="button"
                >
                  <span className="owner-sidebar-section-icon">
                    {section.icon}
                  </span>
                  <span>{section.label}</span>
                  <ChevronDown size={13} className="owner-sidebar-chevron" />
                </button>
                {expandedSection === section.id && (
                  <div className="owner-sidebar-section-items">
                    {section.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `owner-sidebar-item${isActive ? ' active' : ''}`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Animal showcase */}
          <div className="owner-sps" aria-hidden="true">
            <div className="owner-sps-card">
              <DashPawPrint />
              <span className="owner-sps-label">Paws</span>
            </div>
            <div className="owner-sps-card">
              <DashDogFace />
              <span className="owner-sps-label">Dogs</span>
            </div>
            <div className="owner-sps-card">
              <DashCatFace />
              <span className="owner-sps-label">Cats</span>
            </div>
          </div>

          {/* Logout */}
          <button
            className="owner-logout-btn"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* ── Main column ── */}
        <div className="owner-main-col">
          {/* Topbar */}
          <header className="owner-topbar">
            <button
              className="owner-sidebar-toggle"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Toggle sidebar"
              type="button"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <nav className="owner-topbar-nav" aria-label="Quick navigation">
              {topNavItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `owner-topbar-item${isActive ? ' active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="owner-topbar-float-pets" aria-hidden="true">
              {floatingPets.map(p => (
                <span
                  key={p.emoji}
                  className="owner-topbar-float-pet"
                  style={{ animationDuration: p.dur, animationDelay: p.delay }}
                >
                  {p.emoji}
                </span>
              ))}
            </div>

            <div className="owner-topbar-right">
              <NavLink
                to="profile"
                className={({ isActive }) =>
                  `owner-profile-link${isActive ? ' active' : ''}`
                }
              >
                <User size={16} />
                <span>{ownerInfo.ownerName}</span>
              </NavLink>
            </div>
          </header>

          {/* Page content */}
          <main className="owner-content">
            <Outlet context={ownerInfo} />
          </main>
        </div>
      </div>
    </OwnerContext.Provider>
  );
}

export default OwnerDashboard;
