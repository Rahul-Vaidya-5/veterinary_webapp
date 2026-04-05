import './App.css';
import { Route, Routes } from 'react-router-dom';
import MobileEntry from './components/MobileEntry';
import LoginForm from './components/login/LoginForm';
import RegistrationHub from './components/registration/RegistrationHub';
import DoctorRegistration from './components/registration/doctor/DoctorRegistration';
import DoctorHome from './components/doctor/DoctorHome';
import DoctorSetPassword from './components/doctor/DoctorSetPassword';

function App() {
  return (
    <>
      <div className="app-shell">
        <header className="page-header">
          <h1>Vet Application Onboarding</h1>
        </header>
        <Routes>
          <Route path="/" element={<MobileEntry />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationHub />} />
          <Route path="/register/doctor" element={<DoctorRegistration />} />
          <Route path="/doctor/set-password" element={<DoctorSetPassword />} />
          <Route path="/doctor/home" element={<DoctorHome />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
