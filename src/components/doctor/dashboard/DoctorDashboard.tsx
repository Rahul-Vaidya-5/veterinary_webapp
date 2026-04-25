import { createContext, useContext, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  UmbrellaOff,
  User,
  ChevronDown,
  Menu,
  X,
  Receipt,
  Users,
  Package,
  ClipboardList,
  LogOut,
  History,
  Syringe,
  UserPlus,
} from 'lucide-react';
import './DoctorDashboard.css';

export type DoctorInfo = {
  doctorName: string;
  mobileNumber: string;
};

export const DoctorContext = createContext<DoctorInfo>({
  doctorName: 'Doctor',
  mobileNumber: '',
});
export const useDoctorInfo = () => useContext(DoctorContext);

/* ── Topbar Walking Dog ── */
/* ── Sidebar Animal Illustrations ── */
function SidebarDog() {
  return (
    <svg viewBox="0 0 70 80" className="sidebar-pet-svg" aria-label="Dog">
      {/* Tail — rotates from base */}
      <rect
        className="dog-tail"
        x="52"
        y="40"
        width="6"
        height="17"
        rx="3"
        fill="#c47c10"
      />
      {/* Body */}
      <ellipse cx="33" cy="55" rx="20" ry="13" fill="#f4a82a" />
      {/* Head */}
      <circle cx="33" cy="26" r="16" fill="#f4a82a" />
      {/* Ears */}
      <ellipse
        cx="19"
        cy="15"
        rx="7"
        ry="11"
        fill="#c47c10"
        transform="rotate(-15 19 15)"
      />
      <ellipse
        cx="47"
        cy="15"
        rx="7"
        ry="11"
        fill="#c47c10"
        transform="rotate(15 47 15)"
      />
      {/* Snout */}
      <ellipse cx="33" cy="33" rx="9" ry="6" fill="#e8941f" />
      {/* Eyes */}
      <circle cx="26" cy="23" r="4.5" fill="white" />
      <circle cx="40" cy="23" r="4.5" fill="white" />
      <circle cx="27" cy="23" r="2.8" fill="#1a1a2e" />
      <circle cx="41" cy="23" r="2.8" fill="#1a1a2e" />
      <circle cx="28" cy="22" r="1.1" fill="white" />
      <circle cx="42" cy="22" r="1.1" fill="white" />
      {/* Nose */}
      <ellipse cx="33" cy="31" rx="3.5" ry="2.2" fill="#5d3a00" />
      {/* Mouth */}
      <path
        d="M29 35 Q33 38.5 37 35"
        stroke="#5d3a00"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Legs */}
      <rect x="18" y="63" width="7" height="12" rx="3.5" fill="#e8941f" />
      <rect x="28" y="63" width="7" height="12" rx="3.5" fill="#e8941f" />
      <rect x="40" y="63" width="7" height="12" rx="3.5" fill="#e8941f" />
      <rect x="51" y="62" width="6" height="10" rx="3" fill="#e8941f" />
    </svg>
  );
}

function SidebarCat() {
  return (
    <svg viewBox="0 0 70 80" className="sidebar-pet-svg" aria-label="Cat">
      {/* Tail — sways from base */}
      <rect
        className="cat-tail"
        x="51"
        y="49"
        width="5.5"
        height="19"
        rx="2.75"
        fill="#e64a19"
      />
      {/* Body */}
      <ellipse cx="33" cy="57" rx="18" ry="13" fill="#ff8a65" />
      {/* Head */}
      <circle cx="33" cy="26" r="15" fill="#ff8a65" />
      {/* Pointed ears */}
      <polygon points="19,19 12,2 29,14" fill="#ff7043" />
      <polygon points="47,19 58,2 41,14" fill="#ff7043" />
      <polygon points="20,18 16,7 28,14" fill="#ffccbc" />
      <polygon points="46,18 54,7 42,14" fill="#ffccbc" />
      {/* Eyes */}
      <ellipse cx="26" cy="24" rx="5.5" ry="5.5" fill="#b2dfdb" />
      <ellipse cx="40" cy="24" rx="5.5" ry="5.5" fill="#b2dfdb" />
      <ellipse cx="26" cy="24" rx="2.2" ry="5" fill="#1a1a2e" />
      <ellipse cx="40" cy="24" rx="2.2" ry="5" fill="#1a1a2e" />
      <circle cx="25" cy="22" r="1.1" fill="white" />
      <circle cx="39" cy="22" r="1.1" fill="white" />
      {/* Nose */}
      <polygon points="33,31 30,35 36,35" fill="#e91e63" />
      {/* Whiskers */}
      <line
        x1="5"
        y1="29"
        x2="25"
        y2="31"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="33"
        x2="25"
        y2="33"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="61"
        y1="29"
        x2="41"
        y2="31"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="61"
        y1="33"
        x2="41"
        y2="33"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Legs */}
      <rect x="19" y="65" width="7" height="11" rx="3.5" fill="#ff8a65" />
      <rect x="29" y="65" width="7" height="11" rx="3.5" fill="#ff8a65" />
      <rect x="41" y="65" width="7" height="11" rx="3.5" fill="#ff7043" />
    </svg>
  );
}

function SidebarCow() {
  return (
    <svg viewBox="0 0 70 80" className="sidebar-pet-svg" aria-label="Cattle">
      {/* Tail — swishes from base */}
      <rect
        className="cow-tail"
        x="55"
        y="43"
        width="4.5"
        height="16"
        rx="2.25"
        fill="#9e9e9e"
      />
      <circle cx="57.25" cy="60" r="4.5" fill="#757575" />
      {/* Body */}
      <ellipse cx="34" cy="55" rx="22" ry="14" fill="#f5f5f5" />
      {/* Spots */}
      <ellipse
        cx="26"
        cy="52"
        rx="7"
        ry="5"
        fill="#333"
        transform="rotate(-10 26 52)"
      />
      <ellipse cx="45" cy="58" rx="5.5" ry="4" fill="#333" />
      {/* Head */}
      <ellipse cx="33" cy="25" rx="15" ry="14" fill="#f5f5f5" />
      {/* Horns */}
      <path
        d="M21 13 Q16 3 22 6"
        stroke="#a1887f"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M45 13 Q50 3 44 6"
        stroke="#a1887f"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Ears */}
      <ellipse cx="17" cy="20" rx="6.5" ry="8.5" fill="#f5f5f5" />
      <ellipse cx="17" cy="20" rx="3.2" ry="5.2" fill="#ffcdd2" />
      <ellipse cx="49" cy="20" rx="6.5" ry="8.5" fill="#f5f5f5" />
      <ellipse cx="49" cy="20" rx="3.2" ry="5.2" fill="#ffcdd2" />
      {/* Snout */}
      <ellipse cx="33" cy="33" rx="10" ry="7" fill="#ffd6a5" />
      <ellipse cx="29" cy="34" rx="2.2" ry="1.6" fill="#8d6e63" />
      <ellipse cx="37" cy="34" rx="2.2" ry="1.6" fill="#8d6e63" />
      {/* Eyes */}
      <circle cx="25" cy="20" r="4.5" fill="white" />
      <circle cx="41" cy="20" r="4.5" fill="white" />
      <circle cx="26" cy="20" r="2.7" fill="#1a1a2e" />
      <circle cx="42" cy="20" r="2.7" fill="#1a1a2e" />
      <circle cx="27" cy="19" r="1.1" fill="white" />
      {/* Legs */}
      <rect x="17" y="64" width="7" height="12" rx="3" fill="#eeeeee" />
      <rect x="27" y="64" width="7" height="12" rx="3" fill="#eeeeee" />
      <rect x="38" y="64" width="7" height="12" rx="3" fill="#eeeeee" />
      <rect x="50" y="63" width="6" height="10" rx="3" fill="#eeeeee" />
      {/* Udder */}
      <ellipse cx="34" cy="69" rx="9" ry="4" fill="#ffd6a5" />
    </svg>
  );
}

function DoctorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const rawState = location.state as Partial<DoctorInfo> | null;
  const doctorInfo: DoctorInfo = {
    doctorName: rawState?.doctorName ?? 'Doctor',
    mobileNumber: rawState?.mobileNumber ?? '',
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const handleLogout = () => {
    localStorage.removeItem('vc_session_doctor');
    navigate('/', { replace: true });
  };

  const sidebarSections = [
    {
      id: 'history',
      label: 'Medical Records',
      icon: <History size={16} />,
      items: [{ label: 'Medical History', path: 'history' }],
    },
    {
      id: 'expenses',
      label: 'Expenses & Income',
      icon: <Receipt size={16} />,
      items: [
        { label: 'Fill Expenses', path: 'expenses/fill' },
        { label: 'Fill Income', path: 'expenses/income' },
        { label: 'Report', path: 'expenses/report' },
      ],
    },
    {
      id: 'employee',
      label: 'Employee',
      icon: <Users size={16} />,
      items: [
        { label: 'Employee Attendance', path: 'employees/attendance' },
        { label: 'Employee Wages', path: 'employees/wages' },
      ],
    },
    {
      id: 'partners',
      label: 'Partner Doctors',
      icon: <UserPlus size={16} />,
      items: [
        { label: 'Partner Directory', path: 'partners' },
        { label: 'Partner Reports', path: 'partners/reports' },
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package size={16} />,
      items: [
        { label: 'Medical Kit Entry', path: 'inventory/medical-kit' },
        { label: 'Vaccination Entry', path: 'inventory/vaccination' },
        { label: 'Others', path: 'inventory/others' },
      ],
    },
  ];

  const topNavItems = [
    {
      label: 'Appointments',
      path: 'appointments',
      icon: <Calendar size={16} />,
    },
    {
      label: 'Prescriptions',
      path: 'prescriptions',
      icon: <ClipboardList size={16} />,
    },
    {
      label: 'Vaccinations',
      path: 'vaccinations',
      icon: <Syringe size={16} />,
    },
    {
      label: 'Mark Holidays',
      path: 'holidays',
      icon: <UmbrellaOff size={16} />,
    },
  ];

  return (
    <DoctorContext.Provider value={doctorInfo}>
      <div
        className={`doctor-dashboard${sidebarOpen ? '' : ' sidebar-collapsed'}`}
      >
        {/* ── Sidebar ── */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-logo">
            <Stethoscope size={22} />
            <span>VetCare</span>
          </div>
          <section
            className="doctor-identity-card"
            aria-label="Doctor profile summary"
          >
            <div className="doctor-identity-avatar">
              <Stethoscope size={18} />
            </div>
            <div className="doctor-identity-copy">
              <h2>Dr. {doctorInfo.doctorName}</h2>
              <p className="doctor-identity-role">Veterinary Physician</p>
            </div>
          </section>

          <nav className="sidebar-nav">
            {sidebarSections.map(section => (
              <div key={section.id} className="sidebar-section">
                <button
                  className={`sidebar-section-header${expandedSection === section.id ? ' expanded' : ''}`}
                  onClick={() => toggleSection(section.id)}
                  type="button"
                >
                  <span className="sidebar-section-icon">{section.icon}</span>
                  <span>{section.label}</span>
                  <ChevronDown size={13} className="sidebar-chevron" />
                </button>
                {expandedSection === section.id && (
                  <div className="sidebar-section-items">
                    {section.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `sidebar-item${isActive ? ' active' : ''}`
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
          <div className="sidebar-pet-showcase" aria-hidden="true">
            <div className="sps-card">
              <SidebarDog />
              <span className="sps-label">Dogs</span>
            </div>
            <div className="sps-card">
              <SidebarCat />
              <span className="sps-label">Cats</span>
            </div>
            <div className="sps-card">
              <SidebarCow />
              <span className="sps-label">Cattle</span>
            </div>
          </div>

          <div className="sidebar-logout-wrap">
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="dashboard-main">
          {/* Top bar */}
          <header className="dashboard-topbar">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              type="button"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="topbar-nav">
              {topNavItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `topbar-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="topbar-float-pets" aria-hidden="true">
              <span
                className="topbar-float-pet"
                style={{ animationDuration: '3.2s', animationDelay: '0s' }}
              >
                🐕
              </span>
              <span
                className="topbar-float-pet"
                style={{ animationDuration: '4s', animationDelay: '-1.3s' }}
              >
                🐈
              </span>
              <span
                className="topbar-float-pet"
                style={{ animationDuration: '3.6s', animationDelay: '-2.1s' }}
              >
                🐄
              </span>
            </div>

            <div className="topbar-right">
              <NavLink
                to="profile"
                className={({ isActive }) =>
                  `topbar-profile${isActive ? ' active' : ''}`
                }
              >
                <div className="topbar-avatar">
                  <User size={16} />
                </div>
                <span>Dr. {doctorInfo.doctorName}</span>
              </NavLink>
            </div>
          </header>

          {/* Page content */}
          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </DoctorContext.Provider>
  );
}

export default DoctorDashboard;
