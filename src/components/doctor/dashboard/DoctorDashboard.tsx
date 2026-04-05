import { createContext, useContext, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import './DoctorDashboard.css';

export type DoctorInfo = {
  doctorName: string;
  mobileNumber: string;
};

const DoctorContext = createContext<DoctorInfo>({
  doctorName: 'Doctor',
  mobileNumber: '',
});
export const useDoctorInfo = () => useContext(DoctorContext);

function DoctorDashboard() {
  const location = useLocation();
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

  const sidebarSections = [
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
      label: 'Prescriptions',
      path: 'prescriptions',
      icon: <ClipboardList size={16} />,
    },
    {
      label: 'Appointments',
      path: 'appointments',
      icon: <Calendar size={16} />,
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
            <span>VetCare Pro</span>
          </div>
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
