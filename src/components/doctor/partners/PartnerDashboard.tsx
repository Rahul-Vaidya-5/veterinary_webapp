import { useMemo, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  History,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UmbrellaOff,
  User,
  Users,
  X,
} from 'lucide-react';
import { DoctorContext, type DoctorInfo } from '../dashboard/DoctorDashboard';
import { StorageScopeProvider } from '../../../utils/StorageScope';
import type { PartnerDoctor } from './PartnerDoctors';
import './PartnerDashboard.css';

type PartnerDashboardState = Partial<DoctorInfo> & {
  partnerId?: string;
  partnerDoctor?: PartnerDoctor;
};

const LS_PARTNERS = 'vc_partner_doctors';

const loadPartner = (partnerId: string | undefined): PartnerDoctor | null => {
  if (!partnerId) return null;

  try {
    const partners = JSON.parse(
      localStorage.getItem(LS_PARTNERS) ?? '[]',
    ) as PartnerDoctor[];
    const found = partners.find(item => item.id === partnerId) ?? null;
    if (!found) return null;
    return { ...found, isActive: found.isActive !== false };
  } catch {
    return null;
  }
};

function PartnerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const state = (location.state as PartnerDashboardState | undefined) ?? {};
  const partnerId = state.partnerId ?? params.partnerId;
  const partnerDoctor = useMemo(
    () => state.partnerDoctor ?? loadPartner(partnerId),
    [partnerId, state.partnerDoctor],
  );

  if (!partnerDoctor || !partnerId) {
    navigate('/doctor/dashboard/partners', { replace: true });
    return null;
  }

  if (partnerDoctor.isActive === false) {
    navigate('/login', {
      replace: true,
      state: {
        mobileNumber: partnerDoctor.mobileNumber,
        loginRole: 'partner',
        partnerId: partnerDoctor.id,
      },
    });
    return null;
  }

  const doctorInfo: DoctorInfo = {
    doctorName: partnerDoctor.name,
    mobileNumber: partnerDoctor.mobileNumber,
  };
  const storagePrefix = `p_${partnerId}_`;

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

  const sidebarItems = [
    { label: 'Medical History', path: 'history', icon: <History size={16} /> },
    { label: 'Attendance', path: 'attendance', icon: <Users size={16} /> },
    { label: 'Profile', path: 'profile', icon: <User size={16} /> },
  ];

  const logout = () => {
    localStorage.removeItem('vc_session_partner');
    navigate('/', { replace: true });
  };

  return (
    <DoctorContext.Provider value={doctorInfo}>
      <StorageScopeProvider value={storagePrefix}>
        <div
          className={`doctor-dashboard partner-dashboard${sidebarOpen ? '' : ' sidebar-collapsed'}`}
        >
          <aside className="dashboard-sidebar">
            <div className="sidebar-logo">
              <Stethoscope size={22} />
              <span>VetCare Partner</span>
            </div>

            <section
              className="doctor-identity-card partner-identity-card"
              aria-label="Partner doctor summary"
            >
              <div className="doctor-identity-badge">
                <ShieldCheck size={14} />
                <span>Partner Login</span>
              </div>
              <div className="doctor-identity-main">
                <div className="doctor-identity-avatar partner-avatar-wrap">
                  {partnerDoctor.profilePic ? (
                    <img
                      src={partnerDoctor.profilePic}
                      alt={partnerDoctor.name}
                      className="partner-sidebar-image"
                    />
                  ) : (
                    <Stethoscope size={20} />
                  )}
                </div>
                <div className="doctor-identity-copy">
                  <h2>Dr. {partnerDoctor.name}</h2>
                  <p className="doctor-identity-role">
                    {partnerDoctor.specialization}
                  </p>
                </div>
              </div>
              <div className="doctor-identity-meta">
                <span>{partnerDoctor.mobileNumber}</span>
                <span>{partnerDoctor.experience} experience</span>
              </div>
            </section>

            <nav className="sidebar-nav partner-sidebar-nav">
              {sidebarItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item partner-sidebar-item${isActive ? ' active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="sidebar-logout-wrap">
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={logout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          <div className="dashboard-main">
            <header className="dashboard-topbar">
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(open => !open)}
                type="button"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="partner-topbar-copy">
                <p className="partner-topbar-kicker">
                  Partner Doctor Workspace
                </p>
                <h1>
                  Own appointments, prescriptions, vaccinations and holidays
                </h1>
              </div>

              <div className="dashboard-topnav">
                {topNavItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `topnav-link${isActive ? ' active' : ''}`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </header>

            <main className="dashboard-content">
              <Outlet />
            </main>
          </div>
        </div>
      </StorageScopeProvider>
    </DoctorContext.Provider>
  );
}

export default PartnerDashboard;
