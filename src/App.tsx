import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShellLayout from './components/AppShellLayout';
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

// Doctor Dashboard
import DoctorDashboard from './components/doctor/dashboard/DoctorDashboard';
import Prescriptions from './components/doctor/prescriptions/Prescriptions';
import Appointments from './components/doctor/appointments/Appointments';
import MarkHolidays from './components/doctor/holidays/MarkHolidays';
import DoctorProfile from './components/doctor/profile/DoctorProfile';
import FillExpenses from './components/doctor/expenses/FillExpenses';
import FillIncome from './components/doctor/expenses/FillIncome';
import ExpenseReport from './components/doctor/expenses/ExpenseReport';
import EmployeeAttendance from './components/doctor/employee/EmployeeAttendance';
import EmployeeWages from './components/doctor/employee/EmployeeWages';
import MedicalKitEntry from './components/doctor/inventory/MedicalKitEntry';
import VaccinationEntry from './components/doctor/inventory/VaccinationEntry';
import OthersInventory from './components/doctor/inventory/OthersInventory';

function App() {
  return (
    <Routes>
      {/* ── Onboarding shell (header + centered layout) ── */}
      <Route element={<AppShellLayout />}>
        <Route path="/" element={<MobileEntry />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationHub />} />
        <Route path="/register/doctor" element={<DoctorRegistration />} />
        <Route path="/doctor/set-password" element={<DoctorSetPassword />} />
        <Route path="/doctor/home" element={<DoctorHome />} />
        <Route path="/register/animal" element={<AnimalOwnerRegistration />} />
        <Route path="/owner/set-password" element={<OwnerSetPassword />} />
        <Route path="/owner/home" element={<OwnerHome />} />
        <Route path="/register/shop" element={<ShopRegistration />} />
        <Route path="/shop/set-password" element={<ShopSetPassword />} />
        <Route path="/shop/home" element={<ShopHome />} />
      </Route>

      {/* ── Doctor Dashboard (full-screen, own sidebar + topbar) ── */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard />}>
        <Route index element={<Navigate to="appointments" replace />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="holidays" element={<MarkHolidays />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="expenses/fill" element={<FillExpenses />} />
        <Route path="expenses/income" element={<FillIncome />} />
        <Route path="expenses/report" element={<ExpenseReport />} />
        <Route path="employees/attendance" element={<EmployeeAttendance />} />
        <Route path="employees/wages" element={<EmployeeWages />} />
        <Route path="inventory/medical-kit" element={<MedicalKitEntry />} />
        <Route path="inventory/vaccination" element={<VaccinationEntry />} />
        <Route path="inventory/others" element={<OthersInventory />} />
      </Route>
    </Routes>
  );
}

export default App;
