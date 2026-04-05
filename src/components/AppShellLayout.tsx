import { Outlet } from 'react-router-dom';
import '../App.css';

function AppShellLayout() {
  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>Vet Application Onboarding</h1>
      </header>
      <Outlet />
    </div>
  );
}

export default AppShellLayout;
