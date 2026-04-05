import { useLocation, useNavigate } from 'react-router-dom';
import './DoctorHome.css';

type DoctorHomeState = {
  doctorName?: string;
  mobileNumber?: string;
};

function DoctorHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as DoctorHomeState | undefined) ?? {};

  const doctorName = state.doctorName ?? 'Doctor';
  const mobileNumber = state.mobileNumber ?? 'Not provided';

  return (
    <section className="doctor-home">
      <h2>Welcome, Dr. {doctorName}</h2>
      <p>Your registration has been submitted successfully.</p>
      <p>Registered mobile: {mobileNumber}</p>

      <div className="doctor-home-actions">
        <button
          type="button"
          className="btn-dashboard"
          onClick={() =>
            navigate('/doctor/dashboard', {
              state: { doctorName, mobileNumber },
            })
          }
        >
          Go to Dashboard
        </button>
        <button type="button" onClick={() => navigate('/', { replace: true })}>
          Go To Home
        </button>
      </div>
    </section>
  );
}

export default DoctorHome;
