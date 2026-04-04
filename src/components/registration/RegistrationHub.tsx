import './RegistrationHub.css';
interface RegistrationPromptProps {
  mobileNumber: string;
  onGoBack: () => void;
}

function RegistrationHub({ mobileNumber, onGoBack }: RegistrationPromptProps) {
  return (
    <div className="registration-prompt">
      <button className="back-button" onClick={onGoBack}>
        ← Back
      </button>
      <h2>Not registered yet</h2>
      <p>Mobile number {mobileNumber} is not registered with us.</p>
      <p>Please choose your registration type:</p>

      <div className="registration-options">
        <button onClick={() => alert('Doctor registration')}>
          Register as Doctor
        </button>
        <button onClick={() => alert('Animal Owner registration')}>
          Register as Animal Owner
        </button>
        <button onClick={() => alert('Shop registration')}>
          Register as Shop Owner
        </button>
      </div>
    </div>
  );
}

export default RegistrationHub;
