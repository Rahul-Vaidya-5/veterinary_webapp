import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  LogOut,
  Camera,
  Eye,
  EyeOff,
  Check,
  Shield,
  Clock3,
  Smartphone,
  Laptop,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useDoctorInfo } from '../dashboard/DoctorDashboard';
import { formatIstDate } from '../../../utils/istDateTime';
import './DoctorProfile.css';

function DoctorProfile() {
  const { doctorName, mobileNumber } = useDoctorInfo();
  const navigate = useNavigate();

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const linkedDevices = useState(() => {
    const raw = localStorage.getItem('vc_doctor_linked_devices');
    if (!raw) return 1;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return Math.max(1, parsed.length);
      if (typeof parsed === 'number') return Math.max(1, parsed);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'count' in parsed &&
        typeof parsed.count === 'number'
      ) {
        return Math.max(1, parsed.count);
      }
    } catch {
      // Ignore malformed localStorage values and use a safe default.
    }

    return 1;
  })[0];

  const lastLoginLabel = useState(() => {
    const now = new Date();
    const raw = localStorage.getItem('vc_doctor_last_login_ist');

    if (!raw) {
      localStorage.setItem('vc_doctor_last_login_ist', now.toISOString());
      return formatIstDate(now, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const parsedDate = new Date(raw);
    const isInvalidDate = Number.isNaN(parsedDate.getTime());
    if (isInvalidDate) {
      return 'Recently';
    }

    return formatIstDate(parsedDate, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  })[0];

  const hasLength = pwForm.newPw.length >= 8;
  const hasUpper = /[A-Z]/.test(pwForm.newPw);
  const hasNumber = /\d/.test(pwForm.newPw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwForm.newPw);
  const strengthScore = [hasLength, hasUpper, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  const strengthLabel =
    strengthScore <= 1
      ? 'Weak'
      : strengthScore <= 2
        ? 'Fair'
        : strengthScore === 3
          ? 'Good'
          : 'Strong';

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProfilePhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validatePassword = () => {
    const e: Record<string, string> = {};
    if (!pwForm.current) e.current = 'Enter current password';
    if (!pwForm.newPw) e.newPw = 'Enter new password';
    else if (pwForm.newPw.length < 8) e.newPw = 'Minimum 8 characters';
    if (!pwForm.confirm) e.confirm = 'Confirm your new password';
    else if (pwForm.newPw !== pwForm.confirm)
      e.confirm = 'Passwords do not match';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    // In production: call API. For now simulate success.
    setPwSuccess(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.removeItem('vc_session_doctor');
    navigate('/', { replace: true });
  };

  return (
    <div className="profile-page">
      <h1 className="dash-page-title">
        <User size={22} /> Account Center
      </h1>

      {/* ── Profile Card ── */}
      <div className="profile-card dash-card">
        <div className="profile-photo-area">
          <div className="profile-photo-circle">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Doctor account"
                className="profile-photo-img"
              />
            ) : (
              <User size={40} color="#94a3b8" />
            )}
            <label className="photo-upload-btn" title="Change photo">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </label>
          </div>
          <p className="profile-photo-hint">
            Click the camera icon to change photo
          </p>
        </div>

        <div className="profile-main-info">
          <div className="profile-main-heading">
            <h2>Dr. {doctorName}</h2>
            <p>Manage your account, access controls, and clinic workspace.</p>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-tile">
              <span className="profile-info-label">Name</span>
              <span className="profile-info-value">Dr. {doctorName}</span>
            </div>
            <div className="profile-info-tile">
              <span className="profile-info-label">Mobile</span>
              <span className="profile-info-value">{mobileNumber || '—'}</span>
            </div>
            <div className="profile-info-tile">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-value">Veterinary Physician</span>
            </div>
            <div className="profile-info-tile">
              <span className="profile-info-label">Workspace</span>
              <span className="profile-info-value">Clinic Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-overview-section dash-card">
        <div className="profile-overview-head">
          <h2>
            <Activity size={17} /> Work Overview
          </h2>
          <p>See clinic performance and monthly activity in one place.</p>
        </div>
        <button
          type="button"
          className="session-overview-link"
          onClick={() => navigate('/doctor/dashboard/overview')}
        >
          <span className="session-overview-icon">
            <Activity size={15} />
          </span>
          <span className="session-overview-copy">
            <strong>Open Dashboard Overview</strong>
            <span>
              Review appointments, follow-ups, finance, vaccinations,
              attendance, and holidays.
            </span>
          </span>
          <ArrowRight size={15} className="session-overview-arrow" />
        </button>
      </div>

      <div className="profile-panels">
        {/* ── Change Password ── */}
        <div className="profile-section dash-card">
          <h2 className="profile-section-title">
            <Lock size={17} /> Change Password
          </h2>

          {pwSuccess && (
            <div className="pw-success-msg">
              <Check size={15} /> Password changed successfully!
            </div>
          )}

          <form className="pw-form" onSubmit={handleChangePassword} noValidate>
            <label className={pwErrors.current ? 'error' : ''}>
              Current Password
              <div className="pw-input-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={pwForm.current}
                  onChange={e => {
                    setPwForm(f => ({ ...f, current: e.target.value }));
                    setPwErrors(er => {
                      const n = { ...er };
                      delete n.current;
                      return n;
                    });
                  }}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pw-eye"
                  onClick={() => setShowCurrent(v => !v)}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwErrors.current && (
                <span className="err-msg">{pwErrors.current}</span>
              )}
            </label>

            <label className={pwErrors.newPw ? 'error' : ''}>
              New Password
              <div className="pw-input-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.newPw}
                  onChange={e => {
                    setPwForm(f => ({ ...f, newPw: e.target.value }));
                    setPwErrors(er => {
                      const n = { ...er };
                      delete n.newPw;
                      return n;
                    });
                  }}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pw-eye"
                  onClick={() => setShowNew(v => !v)}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwErrors.newPw && (
                <span className="err-msg">{pwErrors.newPw}</span>
              )}
            </label>

            <label className={pwErrors.confirm ? 'error' : ''}>
              Confirm New Password
              <div className="pw-input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={pwForm.confirm}
                  onChange={e => {
                    setPwForm(f => ({ ...f, confirm: e.target.value }));
                    setPwErrors(er => {
                      const n = { ...er };
                      delete n.confirm;
                      return n;
                    });
                  }}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pw-eye"
                  onClick={() => setShowConfirm(v => !v)}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwErrors.confirm && (
                <span className="err-msg">{pwErrors.confirm}</span>
              )}
            </label>

            <div className="pw-strength-wrap" aria-live="polite">
              <div className="pw-strength-head">
                <span>Password Strength</span>
                <strong className={`strength-${strengthLabel.toLowerCase()}`}>
                  {pwForm.newPw ? strengthLabel : 'Not set'}
                </strong>
              </div>
              <div className="pw-strength-bars">
                <span className={strengthScore >= 1 ? 'active' : ''} />
                <span className={strengthScore >= 2 ? 'active' : ''} />
                <span className={strengthScore >= 3 ? 'active' : ''} />
                <span className={strengthScore >= 4 ? 'active' : ''} />
              </div>
              <div className="pw-rules">
                <span className={hasLength ? 'ok' : ''}>8+ chars</span>
                <span className={hasUpper ? 'ok' : ''}>Uppercase</span>
                <span className={hasNumber ? 'ok' : ''}>Number</span>
                <span className={hasSpecial ? 'ok' : ''}>Special</span>
              </div>
            </div>

            <button type="submit" className="btn-change-pw">
              Update Password
            </button>
          </form>
        </div>

        {/* ── Logout ── */}
        <div className="profile-section dash-card logout-section">
          <h2 className="profile-section-title">
            <LogOut size={17} /> Session
          </h2>

          <div className="session-info-grid">
            <div className="session-info-item">
              <Smartphone size={16} />
              <div>
                <strong>Current Device</strong>
                <p>This browser session is active now.</p>
              </div>
            </div>
            <div className="session-info-item">
              <Laptop size={16} />
              <div>
                <strong>Linked Devices</strong>
                <p className="session-stat-value">
                  {linkedDevices} active device(s)
                </p>
              </div>
            </div>
            <div className="session-info-item">
              <Clock3 size={16} />
              <div>
                <strong>Last Login</strong>
                <p className="session-stat-value">{lastLoginLabel} IST</p>
              </div>
            </div>
            <div className="session-info-item">
              <Shield size={16} />
              <div>
                <strong>Security Status</strong>
                <p>
                  Sign out when clinic hours end and rotate password monthly.
                </p>
              </div>
            </div>
          </div>

          {showLogoutConfirm ? (
            <div className="logout-confirm">
              <p>Are you sure you want to log out?</p>
              <div className="logout-actions">
                <button
                  type="button"
                  className="btn-outline-sm"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-logout-confirm"
                  onClick={handleLogout}
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-logout"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={16} /> Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
