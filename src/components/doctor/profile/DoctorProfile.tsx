import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogOut, Camera, Eye, EyeOff, Check } from 'lucide-react';
import { useDoctorInfo } from '../dashboard/DoctorDashboard';
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
        <User size={22} /> Profile
      </h1>

      {/* ── Profile Card ── */}
      <div className="profile-card dash-card">
        <div className="profile-photo-area">
          <div className="profile-photo-circle">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
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

        <div className="profile-info">
          <div className="profile-info-row">
            <span className="profile-info-label">Name</span>
            <span className="profile-info-value">Dr. {doctorName}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Mobile</span>
            <span className="profile-info-value">{mobileNumber || '—'}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Role</span>
            <span className="profile-info-value">Veterinary Physician</span>
          </div>
        </div>
      </div>

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
  );
}

export default DoctorProfile;
