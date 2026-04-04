import { useState, type FormEvent } from 'react';
import './MobileEntry.css';
import LoginForm from './login/LoginForm';
import RegistrationHub from './registration/RegistrationHub';

function MobileEntry() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [userStatus, setUserStatus] = useState<
    null | 'registered' | 'not-registered'
  >(null);

  function handleGoBack() {
    setUserStatus(null);
    setMobileNumber(''); // Optional: clear the number too
  }

  function handleMobileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);

    // Simulate API call
    setTimeout(() => {
      // For demo: if ends with '123', consider registered
      const isRegistered = mobileNumber.endsWith('81');
      setUserStatus(isRegistered ? 'registered' : 'not-registered');
      setIsChecking(false);
    }, 1500);
  }

  if (isChecking) {
    return <div className="loading">Checking registration...</div>;
  }

  if (userStatus === 'registered') {
    return <LoginForm mobileNumber={mobileNumber} onGoBack={handleGoBack} />;
  }

  if (userStatus === 'not-registered') {
    return (
      <RegistrationHub mobileNumber={mobileNumber} onGoBack={handleGoBack} />
    );
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
