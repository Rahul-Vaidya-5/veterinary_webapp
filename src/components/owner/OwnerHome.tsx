import { useLocation, useNavigate } from 'react-router-dom';
import './OwnerHome.css';

type OwnerHomeState = {
  ownerName?: string;
  mobileNumber?: string;
};

function OwnerHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as OwnerHomeState | undefined) ?? {};

  const ownerName = state.ownerName ?? 'Owner';
  const mobileNumber = state.mobileNumber ?? 'Not provided';

  return (
    <section className="owner-home">
      <h2>Welcome, {ownerName}!</h2>
      <p>
        Your animal &amp; owner registration has been submitted successfully.
      </p>
      <p>Registered mobile: {mobileNumber}</p>

      <div className="owner-home-actions">
        <button type="button" onClick={() => navigate('/', { replace: true })}>
          Go To Home
        </button>
      </div>
    </section>
  );
}

export default OwnerHome;
