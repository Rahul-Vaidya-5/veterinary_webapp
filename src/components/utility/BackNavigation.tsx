import { useNavigate } from 'react-router-dom';
type BackButtonProps = {
  fallbackTo?: string;
  label?: string;
  className?: string;
};

function BackButton({
  fallbackTo = '/',
  label = '← Back',
  className = 'back-button',
}: BackButtonProps) {
  const navigate = useNavigate();

  function handleGoBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo, { replace: true });
    }
  }

  return (
    <button type="button" className={className} onClick={handleGoBack}>
      {label}
    </button>
  );
}

export default BackButton;
