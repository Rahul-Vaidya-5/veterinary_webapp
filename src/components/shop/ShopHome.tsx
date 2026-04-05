import { useLocation, useNavigate } from 'react-router-dom';
import './ShopHome.css';

type ShopHomeState = {
  ownerName?: string;
  mobileNumber?: string;
  shopName?: string;
};

function ShopHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ShopHomeState | undefined) ?? {};

  const ownerName = state.ownerName ?? 'Owner';
  const mobileNumber = state.mobileNumber ?? 'Not provided';
  const shopName = state.shopName ?? 'Shop';

  return (
    <section className="shop-home">
      <h2>Welcome, {ownerName}</h2>
      <p>Your shop registration has been submitted successfully.</p>
      <p>Shop Name: {shopName}</p>
      <p>Registered mobile: {mobileNumber}</p>

      <div className="shop-home-actions">
        <button type="button" onClick={() => navigate('/', { replace: true })}>
          Go To Home
        </button>
      </div>
    </section>
  );
}

export default ShopHome;
