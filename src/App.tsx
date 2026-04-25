import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShellLayout from './components/AppShellLayout';
import MobileEntry from './components/MobileEntry';
import HomePage from './components/HomePage.tsx';
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
import DoctorOverview from './components/doctor/dashboard/DoctorOverview.tsx';
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
import Vaccinations from './components/doctor/vaccinations/Vaccinations';
import MedicalHistory from './components/doctor/history/MedicalHistory';
import PartnerDoctors from './components/doctor/partners/PartnerDoctors';
import PartnerDashboard from './components/doctor/partners/PartnerDashboard';
import PartnerProfile from './components/doctor/partners/PartnerProfile';
import PartnerAttendance from './components/doctor/partners/PartnerAttendance';
import PartnerReports from './components/doctor/partners/PartnerReports';
import PartnerStatusManager from './components/doctor/partners/PartnerStatusManager';
import PartnerSetPassword from './components/doctor/partners/PartnerSetPassword';
import ForgotPassword from './components/login/ForgotPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* ── Onboarding shell (header + centered layout) ── */}
      <Route element={<AppShellLayout />}>
        <Route path="/entry" element={<MobileEntry />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationHub />} />
        <Route path="/register/doctor" element={<DoctorRegistration />} />
        <Route path="/doctor/set-password" element={<DoctorSetPassword />} />
        <Route path="/doctor/home" element={<DoctorHome />} />
        <Route path="/partner/set-password" element={<PartnerSetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
        <Route path="overview" element={<DoctorOverview />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="history" element={<MedicalHistory />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="holidays" element={<MarkHolidays />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="partners" element={<PartnerDoctors />} />
        <Route path="partners/reports" element={<PartnerReports />} />
        <Route path="partners/status" element={<PartnerStatusManager />} />
        <Route path="expenses/fill" element={<FillExpenses />} />
        <Route path="expenses/income" element={<FillIncome />} />
        <Route path="expenses/report" element={<ExpenseReport />} />
        <Route path="employees/attendance" element={<EmployeeAttendance />} />
        <Route path="employees/wages" element={<EmployeeWages />} />
        <Route path="inventory/medical-kit" element={<MedicalKitEntry />} />
        <Route path="inventory/vaccination" element={<VaccinationEntry />} />
        <Route path="inventory/others" element={<OthersInventory />} />
        <Route path="vaccinations" element={<Vaccinations />} />
      </Route>

      <Route
        path="/partner/:partnerId/dashboard"
        element={<PartnerDashboard />}
      >
        <Route index element={<Navigate to="appointments" replace />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="vaccinations" element={<Vaccinations />} />
        <Route path="holidays" element={<MarkHolidays />} />
        <Route path="history" element={<MedicalHistory />} />
        <Route path="profile" element={<PartnerProfile />} />
        <Route path="attendance" element={<PartnerAttendance />} />
      </Route>
    </Routes>
  );
}

export default App;
