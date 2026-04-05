import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileEntry.css';

function MobileEntry() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  function handleMobileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);

    // Simulate API call
    setTimeout(() => {
      const isRegistered = mobileNumber.endsWith('81');
      setIsChecking(false);

      if (isRegistered) {
        navigate('/login', { state: { mobileNumber } });
      } else {
        navigate('/register', { state: { mobileNumber } });
      }
    }, 1500);
  }

  if (isChecking) {
    return <div className="loading">Checking registration...</div>;
  }

  function handleMobileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setMobileNumber(value);
  }

  return (
    <div className="mobile-entry">
      <form className="mobile-entry-form" onSubmit={handleMobileSubmit}>
        <label>
          Enter your mobile number
          <input
            type="tel"
            value={mobileNumber}
            onChange={handleMobileChange}
            placeholder="Enter 10-digit number"
            maxLength={10}
            required
          />
        </label>
        <button type="submit">Next</button>
      </form>
    </div>
  );
}

export default MobileEntry;
