import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgePlus,
  BriefcaseMedical,
  Clock3,
  CheckCircle2,
  FileText,
  Phone,
  Stethoscope,
  Upload,
  UserRound,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { formatIstDate } from '../../../utils/istDateTime';
import { useChhattisgarhLocations } from '../../utility/useChhattisgarhLocations';
import './PartnerDoctors.css';
import { ConfirmWithReasonModal } from '../../utility/ConfirmModal';

type Gender = 'male' | 'female' | 'other' | '';

export type PartnerDoctor = {
  id: string;
  name: string;
  mobileNumber: string;
  registrationNumber: string;
  /** Legacy flat address (old records) */
  address?: string;
  /** Structured address (new records) */
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  district?: string;
  block?: string;
  profilePic?: string;
  signature?: string;
  gender: Gender;
  dateOfBirth: string;
  specialization: string;
  experience: string;
  password?: string;
  isActive: boolean;
  deactivationReason?: string;
  deactivatedAt?: string;
  createdAt: string;
};

type Appointment = {
  id: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | string;
};

const LS_PARTNERS = 'vc_partner_doctors';

const loadPartners = (): PartnerDoctor[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_PARTNERS) ?? '[]') as
      | PartnerDoctor[]
      | undefined;
    return (parsed ?? []).map(partner => ({
      ...partner,
      isActive: partner.isActive !== false,
    }));
  } catch {
    return [];
  }
};

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

const countRecords = (key: string) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

const countAppointments = (partnerId: string) => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(`p_${partnerId}_vc_appointments`) ?? '{}',
    ) as Record<string, Appointment[]>;
    return Object.values(parsed).flat().length;
  } catch {
    return 0;
  }
};

const formatAddress = (partner: PartnerDoctor): string => {
  if (partner.addressLine1) {
    return [
      partner.addressLine1,
      partner.addressLine2,
      partner.landmark,
      partner.block,
      partner.district,
    ]
      .filter(Boolean)
      .join(', ');
  }
  return partner.address ?? '';
};

const emptyForm = () => ({
  name: '',
  mobileNumber: '',
  registrationNumber: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  district: '',
  block: '',
  profilePic: '',
  signature: '',
  gender: '' as Gender,
  dateOfBirth: '',
  specialization: '',
  experience: '',
});

function PartnerDoctors() {
  const navigate = useNavigate();
  const { districtNames, getBlocksForDistrict } = useChhattisgarhLocations();
  const [partners, setPartners] = useState<PartnerDoctor[]>(loadPartners);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deactivateTarget, setDeactivateTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [registeredDoctorName, setRegisteredDoctorName] = useState('');
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const availableBlocks = getBlocksForDistrict(form.district);

  const totalPartnerAppointments = useMemo(
    () =>
      partners.reduce((sum, partner) => sum + countAppointments(partner.id), 0),
    [partners],
  );

  const set = (field: keyof ReturnType<typeof emptyForm>, value: string) => {
    setForm(current => {
      const next = { ...current, [field]: value };
      // Reset block when district changes
      if (field === 'district') next.block = '';
      return next;
    });
    setErrors(current => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const persistPartners = (next: PartnerDoctor[]) => {
    setPartners(next);
    localStorage.setItem(LS_PARTNERS, JSON.stringify(next));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = 'Required';
    if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Enter a valid 10-digit number';
    }
    if (!form.registrationNumber.trim())
      nextErrors.registrationNumber = 'Required';
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = 'Required';
    if (!form.district.trim()) nextErrors.district = 'Required';
    if (!form.gender) nextErrors.gender = 'Required';
    if (!form.dateOfBirth) nextErrors.dateOfBirth = 'Required';
    if (!form.specialization.trim()) nextErrors.specialization = 'Required';
    if (!form.experience.trim()) nextErrors.experience = 'Required';
    if (
      partners.some(
        partner => partner.mobileNumber.trim() === form.mobileNumber.trim(),
      )
    ) {
      nextErrors.mobileNumber = 'Mobile number already assigned';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    const partner: PartnerDoctor = {
      id: `partner-${Date.now()}`,
      name: form.name.trim(),
      mobileNumber: form.mobileNumber.trim(),
      registrationNumber: form.registrationNumber.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || undefined,
      landmark: form.landmark.trim() || undefined,
      district: form.district.trim(),
      block: form.block.trim() || undefined,
      profilePic: form.profilePic || undefined,
      signature: form.signature || undefined,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      specialization: form.specialization.trim(),
      experience: form.experience.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    persistPartners([partner, ...partners]);
    setRegisteredDoctorName(partner.name);
    setShowRegistrationPopup(true);
    setForm(emptyForm());
    setErrors({});
    setIsAddFormOpen(false);
  };

  const openReports = () => navigate('/doctor/dashboard/partners/reports');

  const activatePartner = (partnerId: string) => {
    const next = partners.map(partner =>
      partner.id === partnerId ? { ...partner, isActive: true } : partner,
    );
    persistPartners(next);
  };

  const requestDeactivatePartner = (partnerId: string, name: string) => {
    setDeactivateTarget({ id: partnerId, name });
  };

  const confirmDeactivatePartner = (reason: string) => {
    if (!deactivateTarget) return;
    const next = partners.map(partner =>
      partner.id === deactivateTarget.id
        ? {
            ...partner,
            isActive: false,
            deactivationReason: reason.trim(),
            deactivatedAt: new Date().toISOString(),
          }
        : partner,
    );
    persistPartners(next);
    setDeactivateTarget(null);
  };

  return (
    <div className="partner-doctors-page">
      {/* ── Hero banner ── */}
      <header className="partner-hero dash-card">
        <div>
          <p className="partner-hero-kicker">Clinic Team Control</p>
          <h1 className="dash-page-title">
            <BadgePlus size={22} /> Partner Doctors
          </h1>
          <p className="partner-hero-copy">
            Create separate logins for partner doctors and monitor their
            appointments, prescriptions, vaccinations, holidays, and attendance
            from the main dashboard.
          </p>
          <div className="partner-hero-actions">
            <button type="button" onClick={openReports}>
              Partner Reports
            </button>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(open => !open)}
            >
              {isAddFormOpen ? 'Hide Add Partner Form' : 'Add Partner Doctor'}
            </button>
          </div>
        </div>
        <div className="partner-hero-stats">
          <article>
            <span>{partners.length}</span>
            <p>Partner Doctors</p>
          </article>
          <article>
            <span>{totalPartnerAppointments}</span>
            <p>Total Appointments</p>
          </article>
          <article>
            <span>
              {partners.reduce(
                (sum, partner) =>
                  sum + countRecords(`p_${partner.id}_vc_prescriptions`),
                0,
              )}
            </span>
            <p>Prescriptions Written</p>
          </article>
        </div>
      </header>

      {/* ── Partner list (full width, compact rows) ── */}
      <section className="partner-list-card dash-card">
        <div className="partner-list-head">
          <div>
            <h2>Registered Partners</h2>
            <p>
              Each doctor gets isolated appointments, prescriptions,
              vaccinations and holidays. Manage partner login access from here.
            </p>
          </div>
        </div>

        {partners.length === 0 ? (
          <div className="partner-empty-state">
            <Stethoscope size={28} />
            <p>No partner doctors added yet.</p>
          </div>
        ) : (
          <div className="partner-table">
            {/* Table header */}
            <div className="partner-table-row partner-table-header">
              <span>Doctor</span>
              <span>Contact &amp; Address</span>
              <span>Registration</span>
              <span>Status</span>
              <span>Access</span>
            </div>
            {partners.map(partner => (
              <div key={partner.id} className="partner-table-row">
                {/* Doctor info */}
                <div className="ptbl-doctor">
                  <div className="partner-avatar partner-avatar-sm">
                    {partner.profilePic ? (
                      <img src={partner.profilePic} alt={partner.name} />
                    ) : (
                      <BriefcaseMedical size={15} />
                    )}
                  </div>
                  <div className="ptbl-doctor-copy">
                    <strong>Dr. {partner.name}</strong>
                    <span className="ptbl-sub">{partner.specialization}</span>
                    <span className="ptbl-sub">
                      <Clock3 size={11} /> {partner.experience}
                    </span>
                  </div>
                </div>

                {/* Contact + address */}
                <div className="ptbl-col">
                  <span>
                    <Phone size={11} /> {partner.mobileNumber}
                  </span>
                  <span className="ptbl-address-inline">
                    <MapPin size={11} /> {formatAddress(partner) || '—'}
                  </span>
                </div>

                {/* Registration */}
                <div className="ptbl-reg">
                  <span>
                    <FileText size={11} /> {partner.registrationNumber}
                  </span>
                  <span className="ptbl-meta">
                    Added{' '}
                    {formatIstDate(new Date(partner.createdAt), {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Status badge */}
                <div>
                  <span
                    className={`partner-status-badge ${partner.isActive ? 'active' : 'inactive'}`}
                  >
                    {partner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="partner-actions">
                  <button
                    type="button"
                    className={partner.isActive ? 'warn' : 'success'}
                    onClick={() =>
                      partner.isActive
                        ? requestDeactivatePartner(partner.id, partner.name)
                        : activatePartner(partner.id)
                    }
                  >
                    {partner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Registration form (collapsible + bottom) ── */}
      <section className="partner-form-card dash-card partner-add-panel">
        <button
          type="button"
          className={`partner-add-toggle${isAddFormOpen ? ' open' : ''}`}
          onClick={() => setIsAddFormOpen(open => !open)}
        >
          <span>
            <BadgePlus size={16} /> Add New Partner Doctor
          </span>
          <ChevronDown size={16} />
        </button>

        {isAddFormOpen && (
          <div className="partner-add-panel-body">
            <p className="partner-form-intro">
              Fill in the details below to create an isolated login for the
              partner doctor.
            </p>

            {/* Personal details */}
            <h3 className="partner-section-label">
              Personal &amp; Professional
            </h3>
            <div className="partner-grid partner-grid-cols-3">
              <label className={errors.name ? 'error' : ''}>
                Full Name *
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Dr. Firstname Lastname"
                />
                {errors.name && <span className="err-msg">{errors.name}</span>}
              </label>
              <label className={errors.mobileNumber ? 'error' : ''}>
                Mobile Number *
                <input
                  value={form.mobileNumber}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={e =>
                    set(
                      'mobileNumber',
                      e.target.value.replace(/\D/g, '').slice(0, 10),
                    )
                  }
                  placeholder="10-digit number"
                />
                {errors.mobileNumber && (
                  <span className="err-msg">{errors.mobileNumber}</span>
                )}
              </label>
              <label className={errors.registrationNumber ? 'error' : ''}>
                Registration Number *
                <input
                  value={form.registrationNumber}
                  onChange={e => set('registrationNumber', e.target.value)}
                  placeholder="Council reg. no."
                />
                {errors.registrationNumber && (
                  <span className="err-msg">{errors.registrationNumber}</span>
                )}
              </label>
              <label className={errors.gender ? 'error' : ''}>
                Gender *
                <select
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <span className="err-msg">{errors.gender}</span>
                )}
              </label>
              <label className={errors.dateOfBirth ? 'error' : ''}>
                Date of Birth *
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => set('dateOfBirth', e.target.value)}
                />
                {errors.dateOfBirth && (
                  <span className="err-msg">{errors.dateOfBirth}</span>
                )}
              </label>
              <label className={errors.specialization ? 'error' : ''}>
                Specialization *
                <input
                  value={form.specialization}
                  onChange={e => set('specialization', e.target.value)}
                  placeholder="e.g. Small Animal Surgery"
                />
                {errors.specialization && (
                  <span className="err-msg">{errors.specialization}</span>
                )}
              </label>
              <label className={errors.experience ? 'error' : ''}>
                Experience *
                <input
                  value={form.experience}
                  onChange={e => set('experience', e.target.value)}
                  placeholder="e.g. 5 years"
                />
                {errors.experience && (
                  <span className="err-msg">{errors.experience}</span>
                )}
              </label>
            </div>

            {/* Address */}
            <h3 className="partner-section-label">
              <MapPin size={14} /> Address
            </h3>
            <div className="partner-grid partner-grid-cols-2">
              <label
                className={`partner-span-2 ${errors.addressLine1 ? 'error' : ''}`}
              >
                Address Line 1 *
                <input
                  value={form.addressLine1}
                  onChange={e => set('addressLine1', e.target.value)}
                  placeholder="House no., street, village"
                />
                {errors.addressLine1 && (
                  <span className="err-msg">{errors.addressLine1}</span>
                )}
              </label>
              <label className="partner-span-2">
                Address Line 2
                <input
                  value={form.addressLine2}
                  onChange={e => set('addressLine2', e.target.value)}
                  placeholder="Mohalla, area, PO (optional)"
                />
              </label>
              <label>
                Landmark
                <input
                  value={form.landmark}
                  onChange={e => set('landmark', e.target.value)}
                  placeholder="Near school / temple (optional)"
                />
              </label>
              <label className={errors.district ? 'error' : ''}>
                District *
                <select
                  value={form.district}
                  onChange={e => set('district', e.target.value)}
                >
                  <option value="">— Select District —</option>
                  {districtNames.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <span className="err-msg">{errors.district}</span>
                )}
              </label>
              {availableBlocks.length > 0 && (
                <label>
                  Block / Tehsil
                  <select
                    value={form.block}
                    onChange={e => set('block', e.target.value)}
                  >
                    <option value="">— Select Block —</option>
                    {availableBlocks.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {/* Uploads */}
            <h3 className="partner-section-label">Profile &amp; Signature</h3>
            <div className="partner-grid partner-grid-cols-2">
              <label>
                Profile Picture
                <span className="file-picker">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const img = await toDataUrl(file);
                      set('profilePic', img);
                    }}
                  />
                  <Upload size={14} /> Upload photo
                </span>
              </label>
              <label>
                Signature
                <span className="file-picker">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const img = await toDataUrl(file);
                      set('signature', img);
                    }}
                  />
                  <Upload size={14} /> Upload signature
                </span>
              </label>
              <div className="preview-card">
                <p>Profile Preview</p>
                {form.profilePic ? (
                  <img src={form.profilePic} alt="Profile preview" />
                ) : (
                  <UserRound size={22} />
                )}
              </div>
              <div className="preview-card signature-card">
                <p>Signature Preview</p>
                {form.signature ? (
                  <img src={form.signature} alt="Signature preview" />
                ) : (
                  <FileText size={22} />
                )}
              </div>
            </div>

            <div className="partner-form-footer">
              <button
                type="button"
                className="partner-submit-btn"
                onClick={submit}
              >
                <BadgePlus size={16} /> Create Partner Login
              </button>
              <p className="partner-first-login-note">
                Partner doctor will set their personal password on first login.
              </p>
            </div>
          </div>
        )}
      </section>

      <ConfirmWithReasonModal
        open={deactivateTarget !== null}
        title="Deactivate Partner Doctor"
        message={`You are deactivating Dr. ${deactivateTarget?.name ?? ''}. Please provide a reason before proceeding.`}
        reasonPlaceholder="e.g. Temporarily unavailable / access paused"
        confirmLabel="Deactivate"
        onConfirm={confirmDeactivatePartner}
        onCancel={() => setDeactivateTarget(null)}
      />

      {showRegistrationPopup && (
        <div
          className="partner-success-popup-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="partner-success-popup">
            <div className="partner-success-icon">
              <CheckCircle2 size={22} />
            </div>
            <h3>Partner Doctor Registered</h3>
            <p>
              Dr. {registeredDoctorName} has been added successfully and can now
              log in with their mobile number.
            </p>
            <button
              type="button"
              onClick={() => setShowRegistrationPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerDoctors;
