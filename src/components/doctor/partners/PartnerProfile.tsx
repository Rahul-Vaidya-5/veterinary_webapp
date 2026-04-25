import {
  CalendarDays,
  FileSignature,
  Phone,
  ShieldCheck,
  User2,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { formatIstDate } from '../../../utils/istDateTime';
import type { PartnerDoctor } from './PartnerDoctors';
import './PartnerProfile.css';

type PartnerProfileState = {
  partnerDoctor?: PartnerDoctor;
};

function PartnerProfile() {
  const location = useLocation();
  const partnerDoctor = (location.state as PartnerProfileState | undefined)
    ?.partnerDoctor;

  if (!partnerDoctor) {
    return (
      <div className="partner-profile-page dash-card">
        <p>Partner doctor details are not available.</p>
      </div>
    );
  }

  return (
    <div className="partner-profile-page">
      <header className="partner-profile-hero dash-card">
        <div className="partner-profile-main">
          <div className="partner-profile-avatar">
            {partnerDoctor.profilePic ? (
              <img src={partnerDoctor.profilePic} alt={partnerDoctor.name} />
            ) : (
              <User2 size={28} />
            )}
          </div>
          <div>
            <p className="partner-profile-kicker">Partner Account</p>
            <h1>Dr. {partnerDoctor.name}</h1>
            <p className="partner-profile-subtitle">
              {partnerDoctor.specialization}
            </p>
          </div>
        </div>
        <div className="partner-profile-badges">
          <span>
            <ShieldCheck size={14} /> Verified partner login
          </span>
          <span>
            <Phone size={14} /> {partnerDoctor.mobileNumber}
          </span>
        </div>
      </header>

      <section className="partner-profile-grid">
        <article className="dash-card">
          <h2>Professional Details</h2>
          <div className="partner-profile-list">
            <div>
              <strong>Registration No.</strong>
              <span>{partnerDoctor.registrationNumber}</span>
            </div>
            <div>
              <strong>Specialization</strong>
              <span>{partnerDoctor.specialization}</span>
            </div>
            <div>
              <strong>Experience</strong>
              <span>{partnerDoctor.experience}</span>
            </div>
            <div>
              <strong>Gender</strong>
              <span>{partnerDoctor.gender || '—'}</span>
            </div>
          </div>
        </article>

        <article className="dash-card">
          <h2>Personal Details</h2>
          <div className="partner-profile-list">
            <div>
              <strong>Date of Birth</strong>
              <span>
                {partnerDoctor.dateOfBirth
                  ? formatIstDate(new Date(partnerDoctor.dateOfBirth), {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
            <div>
              <strong>Address</strong>
              <span>{partnerDoctor.address}</span>
            </div>
            <div>
              <strong>Created On</strong>
              <span>
                {formatIstDate(new Date(partnerDoctor.createdAt), {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </article>

        <article className="dash-card partner-signature-card">
          <h2>
            <FileSignature size={18} /> Signature
          </h2>
          {partnerDoctor.signature ? (
            <img src={partnerDoctor.signature} alt="Doctor signature" />
          ) : (
            <p>No signature uploaded.</p>
          )}
        </article>

        <article className="dash-card partner-summary-card">
          <h2>
            <CalendarDays size={18} /> Access Summary
          </h2>
          <ul>
            <li>Can manage own appointments</li>
            <li>Can create prescriptions and vaccination entries</li>
            <li>Can mark own holidays</li>
            <li>Can see own medical history and attendance</li>
            <li>
              Cannot access clinic expenses, overview dashboard, or employee
              management
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}

export default PartnerProfile;
