import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileEntry.css';

const MOBILE_LENGTH = 10;

function MobileEntry() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const isValidMobile = mobileNumber.length === MOBILE_LENGTH;

  function handleMobileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidMobile) {
      setValidationMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setValidationMessage('');
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
    return (
      <div className="loading-card" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-title">Checking your number</p>
        <p className="loading-subtitle">
          Verifying your account in our system. This usually takes a second.
        </p>
      </div>
    );
  }

  function handleMobileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
      .replace(/[^0-9]/g, '')
      .slice(0, MOBILE_LENGTH);
    setMobileNumber(value);

    if (validationMessage) {
      setValidationMessage('');
    }
  }

  function clearMobileNumber() {
    setMobileNumber('');
    setValidationMessage('');
  }

  return (
    <div className="mobile-entry">
      <form className="mobile-entry-form" onSubmit={handleMobileSubmit}>
        <label htmlFor="mobile-input">
          Enter your mobile number
          <div
            className={`mobile-input-wrap ${isFocused ? 'is-focused' : ''} ${validationMessage ? 'has-error' : ''}`}
          >
            <span className="country-code">+91</span>
            <input
              id="mobile-input"
              type="tel"
              value={mobileNumber}
              onChange={handleMobileChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter 10-digit number"
              inputMode="numeric"
              maxLength={MOBILE_LENGTH}
              required
            />
            {mobileNumber && (
              <button
                type="button"
                className="clear-mobile"
                onClick={clearMobileNumber}
                aria-label="Clear mobile number"
              >
                Clear
              </button>
            )}
          </div>
        </label>

        <div className="mobile-entry-meta" aria-live="polite">
          <p className={`digit-count ${isValidMobile ? 'is-valid' : ''}`}>
            {mobileNumber.length}/{MOBILE_LENGTH} digits
          </p>
          {validationMessage ? (
            <p className="field-error">{validationMessage}</p>
          ) : (
            <p className="field-hint">
              {isValidMobile
                ? 'Looks good. Tap / Click on "Check Number" to continue.'
                : 'We will check if your number already exists in the system.'}
            </p>
          )}
        </div>

        <button className="submit-btn" type="submit" disabled={!isValidMobile}>
          Check Number
        </button>
      </form>
    </div>
  );
}

export default MobileEntry;
