import './App.css';
import { Route, Routes } from 'react-router-dom';
import MobileEntry from './components/MobileEntry';
import LoginForm from './components/login/LoginForm';
import RegistrationHub from './components/registration/RegistrationHub';
import DoctorRegistration from './components/registration/doctor/DoctorRegistration';
import DoctorHome from './components/doctor/DoctorHome';
import DoctorSetPassword from './components/doctor/DoctorSetPassword';
import AnimalOwnerRegistration from './components/registration/animal/AnimalOwnerRegistration';
import OwnerHome from './components/owner/OwnerHome';
import OwnerSetPassword from './components/owner/OwnerSetPassword';
import ShopRegistration from './components/registration/shop/ShopRegistration';
import ShopHome from './components/shop/ShopHome';
import ShopSetPassword from './components/shop/ShopSetPassword';

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
          <Route
            path="/register/animal"
            element={<AnimalOwnerRegistration />}
          />
          <Route path="/owner/set-password" element={<OwnerSetPassword />} />
          <Route path="/owner/home" element={<OwnerHome />} />
          <Route path="/register/shop" element={<ShopRegistration />} />
          <Route path="/shop/set-password" element={<ShopSetPassword />} />
          <Route path="/shop/home" element={<ShopHome />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
