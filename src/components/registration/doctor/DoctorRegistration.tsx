type Address = {
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  block: string;
  district: string;
  state: string;
};

type DoctorForm = {
  gender: string;
  firstName: string;
  lastName: string;
  email: string;
  experience: number;
  dateOfBirth: string;
  mobileNumber: string;
  specialization: string;
  licenseNumber: string;
  profilePhotoFile: File | null;
  profilePhotoUrl: string;
  doctorSignatureFile: File | null;
  doctorSignatureUrl: string;
  address: Address;
};

type ClinicForm = {
  clinicName: string;
  clinicPhone: string;
  sameAsDoctor: boolean;
  clinicPhotoFile: File | null;
  clinicPhotoUrl: string;
  address: Address;
};

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  MapPinned,
  Building2,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Send,
} from 'lucide-react';
import SearchableSelectInput from '../../utility/SearchableSelectInput';
import { useChhattisgarhLocations } from '../../utility/useChhattisgarhLocations';
import './DoctorRegistration.css';

const emptyAddress: Address = {
  line1: '',
  line2: '',
  landmark: '',
  pincode: '',
  block: '',
  district: '',
  state: 'Chhattisgarh',
};

const initialDoctorForm: DoctorForm = {
  gender: '',
  firstName: '',
  lastName: '',
  email: '',
  experience: 0,
  dateOfBirth: '',
  mobileNumber: '',
  specialization: '',
  licenseNumber: '',
  profilePhotoFile: null,
  profilePhotoUrl: '',
  doctorSignatureFile: null,
  doctorSignatureUrl: '',
  address: { ...emptyAddress },
};

const initialClinicForm: ClinicForm = {
  clinicName: '',
  clinicPhone: '',
  sameAsDoctor: false,
  clinicPhotoFile: null,
  clinicPhotoUrl: '',
  address: { ...emptyAddress },
};

function DoctorRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber =
    (location.state as { mobileNumber?: string } | undefined)?.mobileNumber ??
    '';
  const ENABLE_STEP_VALIDATION =
    import.meta.env.VITE_ENABLE_STEP_VALIDATION === 'true';
  const [doctor, setDoctor] = useState<DoctorForm>(() => ({
    ...initialDoctorForm,
    address: { ...initialDoctorForm.address },
    mobileNumber,
  }));
  const [clinic, setClinic] = useState<ClinicForm>(initialClinicForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [hasAcceptedDeclaration, setHasAcceptedDeclaration] = useState(false);
  const { districtNames, getBlocksForDistrict, isKnownDistrict, isKnownBlock } =
    useChhattisgarhLocations();

  const doctorBlockOptions = getBlocksForDistrict(doctor.address.district);
  const clinicBlockOptions = getBlocksForDistrict(clinic.address.district);

  function handleDoctorChange<K extends keyof Omit<DoctorForm, 'address'>>(
    field: K,
    value: DoctorForm[K],
  ) {
    setDoctor(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleDoctorAddressChange<K extends keyof Address>(
    field: K,
    value: Address[K],
  ) {
    setDoctor(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...(field === 'district' ? { block: '' } : {}),
        [field]: value,
      },
    }));
  }

  function handleClinicChange<K extends keyof Omit<ClinicForm, 'address'>>(
    field: K,
    value: ClinicForm[K],
  ) {
    setClinic(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleClinicAddressChange<K extends keyof Address>(
    field: K,
    value: Address[K],
  ) {
    setClinic(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...(field === 'district' ? { block: '' } : {}),
        [field]: value,
      },
    }));
  }

  function handleSameAsDoctorChange(checked: boolean) {
    setClinic(prev => ({
      ...prev,
      sameAsDoctor: checked,
      address: checked ? { ...doctor.address } : { ...emptyAddress },
    }));
  }

  useEffect(() => {
    if (clinic.sameAsDoctor) {
      setClinic(prev => ({
        ...prev,
        address: { ...doctor.address },
      }));
    }
  }, [doctor.address, clinic.sameAsDoctor]);

  function handleDoctorSignatureChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;
    setDoctor(prev => ({
      ...prev,
      doctorSignatureFile: file,
      doctorSignatureUrl: file ? URL.createObjectURL(file) : '',
    }));
  }

  function handleDoctorProfilePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;
    setDoctor(prev => ({
      ...prev,
      profilePhotoFile: file,
      profilePhotoUrl: file ? URL.createObjectURL(file) : '',
    }));
  }

  function handleClinicPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setClinic(prev => ({
      ...prev,
      clinicPhotoFile: file,
      clinicPhotoUrl: file ? URL.createObjectURL(file) : '',
    }));
  }

  function validateStep1() {
    if (!doctor.gender) return 'Gender is required.';
    if (!doctor.firstName.trim()) return 'First name is required.';
    if (!doctor.lastName.trim()) return 'Last name is required.';
    if (!doctor.mobileNumber || doctor.mobileNumber.length !== 10) {
      return 'Mobile number must be 10 digits.';
    }
    if (!doctor.dateOfBirth) return 'Date of birth is required.';
    if (doctor.experience < 0) return 'Experience cannot be negative.';
    if (!doctor.licenseNumber.trim()) return 'License number is required.';
    return '';
  }

  function validateStep2() {
    if (!doctor.address.line1.trim())
      return 'Doctor address line 1 is required.';
    if (!doctor.address.pincode || doctor.address.pincode.length !== 6) {
      return 'Doctor pincode must be 6 digits.';
    }
    if (!doctor.address.block.trim()) return 'Doctor block is required.';
    if (!doctor.address.district.trim()) return 'Doctor district is required.';
    if (districtNames.length > 0 && !isKnownDistrict(doctor.address.district)) {
      return 'Select a valid doctor district from the list.';
    }
    if (
      districtNames.length > 0 &&
      !isKnownBlock(doctor.address.district, doctor.address.block)
    ) {
      return 'Select a valid doctor block from the list.';
    }
    if (!doctor.address.state.trim()) return 'Doctor state is required.';
    return '';
  }

  function validateStep3() {
    if (!clinic.clinicName.trim()) return 'Clinic name is required.';
    if (!clinic.clinicPhone || clinic.clinicPhone.length !== 10) {
      return 'Clinic phone must be 10 digits.';
    }
    if (!clinic.sameAsDoctor) {
      if (!clinic.address.line1.trim())
        return 'Clinic address line 1 is required.';
      if (!clinic.address.pincode || clinic.address.pincode.length !== 6) {
        return 'Clinic pincode must be 6 digits.';
      }
      if (!clinic.address.block.trim()) return 'Clinic block is required.';
      if (!clinic.address.district.trim())
        return 'Clinic district is required.';
      if (
        districtNames.length > 0 &&
        !isKnownDistrict(clinic.address.district)
      ) {
        return 'Select a valid clinic district from the list.';
      }
      if (
        districtNames.length > 0 &&
        !isKnownBlock(clinic.address.district, clinic.address.block)
      ) {
        return 'Select a valid clinic block from the list.';
      }
      if (!clinic.address.state.trim()) return 'Clinic state is required.';
    }
    return '';
  }

  function handleNextStep() {
    if (!ENABLE_STEP_VALIDATION) {
      setStepError('');
      setCurrentStep(prev => Math.min(prev + 1, 4));
      return;
    }

    let error = '';
    if (currentStep === 1) error = validateStep1();
    if (currentStep === 2) error = validateStep2();
    if (currentStep === 3) error = validateStep3();

    if (error) {
      setStepError(error);
      return;
    }

    setStepError('');
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }

  function handlePreviousStep() {
    setStepError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAcceptedDeclaration) {
      setStepError('Please accept the declaration before submitting.');
      return;
    }

    // Later replace with API calls
    console.log('Doctor form:', doctor);
    console.log('Clinic form:', clinic);

    navigate('/doctor/set-password', {
      replace: true,
      state: {
        doctorName: `${doctor.firstName} ${doctor.lastName}`.trim(),
        mobileNumber: doctor.mobileNumber,
      },
    });
  }

  const stepLabels = ['Personal Info', 'Address', 'Clinic', 'Review'];

  return (
    <div className="doctor-registration">
      <div className="step-meta">
        <div className="step-progress">
          {stepLabels.map((label, i) => (
            <div
              key={i}
              className={`step-pill ${i + 1 === currentStep ? 'active' : i + 1 < currentStep ? 'done' : ''}`}
            >
              <div className="step-pill-circle">
                {i + 1 < currentStep ? '✓' : i + 1}
              </div>
              <span className="step-pill-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
      {stepError && (
        <div className="form-error" role="alert">
          <span>{stepError}</span>
          <button
            type="button"
            className="form-error-close"
            onClick={() => setStepError('')}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <>
            <h3 className="step-heading">
              <Stethoscope size={18} />
              <span>Doctor Basic Details</span>
            </h3>

            <label className="first-name-field">
              First Name *
              <input
                type="text"
                value={doctor.firstName}
                onChange={e => handleDoctorChange('firstName', e.target.value)}
              />
            </label>
            <label>
              Last Name *
              <input
                type="text"
                value={doctor.lastName}
                onChange={e => handleDoctorChange('lastName', e.target.value)}
              />
            </label>
            <label>
              Email (Optional)
              <input
                type="email"
                value={doctor.email}
                onChange={e => handleDoctorChange('email', e.target.value)}
              />
            </label>
            <label>
              Mobile Number *
              <input
                type="tel"
                value={doctor.mobileNumber}
                maxLength={10}
                disabled
                readOnly
              />
            </label>
            <label>
              Date of Birth *
              <input
                type="date"
                value={doctor.dateOfBirth}
                onChange={e =>
                  handleDoctorChange('dateOfBirth', e.target.value)
                }
              />
            </label>
            <label>
              Gender *
              <select
                value={doctor.gender}
                onChange={e => handleDoctorChange('gender', e.target.value)}
              >
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
            <label>
              Experience (years) *
              <input
                type="number"
                min={0}
                value={doctor.experience}
                onChange={e =>
                  handleDoctorChange('experience', Number(e.target.value))
                }
              />
            </label>
            <label>
              Specialization (Optional)
              <input
                type="text"
                value={doctor.specialization}
                onChange={e =>
                  handleDoctorChange('specialization', e.target.value)
                }
              />
            </label>
            <label>
              License Number *
              <input
                type="text"
                value={doctor.licenseNumber}
                onChange={e =>
                  handleDoctorChange('licenseNumber', e.target.value)
                }
              />
            </label>

            <label>
              Doctor Photo (Optional)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleDoctorProfilePhotoChange}
              />
            </label>

            <label>
              Doctor Signature (Optional)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleDoctorSignatureChange}
              />
            </label>

            {(doctor.profilePhotoUrl || doctor.doctorSignatureUrl) && (
              <div className="upload-preview-row">
                {doctor.profilePhotoUrl && (
                  <img
                    src={doctor.profilePhotoUrl}
                    alt="Doctor profile preview"
                    width={180}
                  />
                )}
                {doctor.doctorSignatureUrl && (
                  <img
                    src={doctor.doctorSignatureUrl}
                    alt="Doctor signature preview"
                    width={180}
                  />
                )}
              </div>
            )}
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3 className="step-heading">
              <MapPinned size={18} />
              <span>Doctor Address</span>
            </h3>

            <label>
              Doctor Address Line 1 *
              <input
                type="text"
                value={doctor.address.line1}
                onChange={e =>
                  handleDoctorAddressChange('line1', e.target.value)
                }
              />
            </label>
            <label>
              Doctor Address Line 2
              <input
                type="text"
                value={doctor.address.line2}
                onChange={e =>
                  handleDoctorAddressChange('line2', e.target.value)
                }
              />
            </label>
            <label>
              Landmark
              <input
                type="text"
                value={doctor.address.landmark}
                onChange={e =>
                  handleDoctorAddressChange('landmark', e.target.value)
                }
              />
            </label>
            <label>
              Pincode *
              <input
                type="text"
                value={doctor.address.pincode}
                onChange={e =>
                  handleDoctorAddressChange(
                    'pincode',
                    e.target.value.replace(/[^0-9]/g, ''),
                  )
                }
                maxLength={6}
              />
            </label>
            <label>
              State *
              <input
                type="text"
                value={doctor.address.state}
                onChange={e =>
                  handleDoctorAddressChange('state', e.target.value)
                }
              />
            </label>
            <label>
              District *
              <SearchableSelectInput
                inputId="doctor-district"
                listId="doctor-district-list"
                value={doctor.address.district}
                onChange={value => handleDoctorAddressChange('district', value)}
                options={districtNames}
                placeholder="Search and select district"
              />
            </label>
            <label>
              Block *
              <SearchableSelectInput
                inputId="doctor-block"
                listId="doctor-block-list"
                value={doctor.address.block}
                onChange={value => handleDoctorAddressChange('block', value)}
                options={doctorBlockOptions}
                placeholder={
                  doctor.address.district
                    ? 'Search and select block'
                    : 'Select district first'
                }
                disabled={!doctor.address.district.trim()}
              />
            </label>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h3 className="step-heading">
              <Building2 size={18} />
              <span>Clinic Details</span>
            </h3>

            <label>
              Clinic Name *
              <input
                type="text"
                value={clinic.clinicName}
                onChange={e => handleClinicChange('clinicName', e.target.value)}
              />
            </label>
            <label>
              Clinic Phone *
              <input
                type="tel"
                value={clinic.clinicPhone}
                onChange={e =>
                  handleClinicChange(
                    'clinicPhone',
                    e.target.value.replace(/[^0-9]/g, ''),
                  )
                }
                maxLength={10}
              />
            </label>

            <label>
              <input
                type="checkbox"
                checked={clinic.sameAsDoctor}
                onChange={e => handleSameAsDoctorChange(e.target.checked)}
              />
              Clinic address same as doctor
            </label>

            <label>
              Clinic Address Line 1 *
              <input
                type="text"
                value={clinic.address.line1}
                onChange={e =>
                  handleClinicAddressChange('line1', e.target.value)
                }
                disabled={clinic.sameAsDoctor}
              />
            </label>

            <label>
              Clinic Address Line 2
              <input
                type="text"
                value={clinic.address.line2}
                onChange={e =>
                  handleClinicAddressChange('line2', e.target.value)
                }
                disabled={clinic.sameAsDoctor}
              />
            </label>

            <label>
              Landmark
              <input
                type="text"
                value={clinic.address.landmark}
                onChange={e =>
                  handleClinicAddressChange('landmark', e.target.value)
                }
                disabled={clinic.sameAsDoctor}
              />
            </label>

            <label>
              Pincode *
              <input
                type="text"
                value={clinic.address.pincode}
                onChange={e =>
                  handleClinicAddressChange(
                    'pincode',
                    e.target.value.replace(/[^0-9]/g, ''),
                  )
                }
                maxLength={6}
                disabled={clinic.sameAsDoctor}
              />
            </label>
            <label>
              State *
              <input
                type="text"
                value={clinic.address.state}
                onChange={e =>
                  handleClinicAddressChange('state', e.target.value)
                }
                disabled={clinic.sameAsDoctor}
              />
            </label>
            <label>
              District *
              <SearchableSelectInput
                inputId="clinic-district"
                listId="clinic-district-list"
                value={clinic.address.district}
                onChange={value => handleClinicAddressChange('district', value)}
                options={districtNames}
                placeholder="Search and select district"
                disabled={clinic.sameAsDoctor}
              />
            </label>
            <label>
              Block *
              <SearchableSelectInput
                inputId="clinic-block"
                listId="clinic-block-list"
                value={clinic.address.block}
                onChange={value => handleClinicAddressChange('block', value)}
                options={clinicBlockOptions}
                placeholder={
                  clinic.address.district
                    ? 'Search and select block'
                    : 'Select district first'
                }
                disabled={
                  clinic.sameAsDoctor || !clinic.address.district.trim()
                }
              />
            </label>

            <label>
              Clinic Photo (Optional)
              <input
                type="file"
                accept="image/*"
                onChange={handleClinicPhotoChange}
              />
            </label>

            {clinic.clinicPhotoUrl && (
              <img
                src={clinic.clinicPhotoUrl}
                alt="Clinic photo preview"
                width={220}
              />
            )}
          </>
        )}

        {currentStep === 4 && (
          <div className="review-block">
            <h3 className="step-heading review-heading">
              <ClipboardCheck size={18} />
              <span>Review and Submit</span>
            </h3>

            <div className="review-grid">
              <section className="review-card">
                <h4>Doctor Summary</h4>
                <dl>
                  <dt>Doctor Name</dt>
                  <dd>
                    {doctor.firstName || doctor.lastName
                      ? `${doctor.firstName} ${doctor.lastName}`.trim()
                      : '—'}
                  </dd>
                  <dt>Gender</dt>
                  <dd>{doctor.gender || '—'}</dd>
                  <dt>Mobile</dt>
                  <dd>{doctor.mobileNumber || '—'}</dd>
                  <dt>Date of Birth</dt>
                  <dd>{doctor.dateOfBirth || '—'}</dd>
                  <dt>Experience</dt>
                  <dd>
                    {doctor.experience ? `${doctor.experience} years` : '—'}
                  </dd>
                  <dt>License Number</dt>
                  <dd>{doctor.licenseNumber || '—'}</dd>
                  <dt>Address</dt>
                  <dd>{doctor.address.line1 || '—'}</dd>
                  <dt>Area</dt>
                  <dd>
                    {doctor.address.block ||
                    doctor.address.district ||
                    doctor.address.state ||
                    doctor.address.pincode
                      ? `${doctor.address.block}, ${doctor.address.district}, ${doctor.address.state} - ${doctor.address.pincode}`
                      : '—'}
                  </dd>
                  <dt>Photo</dt>
                  <dd>
                    {doctor.profilePhotoFile
                      ? doctor.profilePhotoFile.name
                      : 'Not provided'}
                  </dd>
                </dl>
                {doctor.profilePhotoUrl && (
                  <img
                    src={doctor.profilePhotoUrl}
                    alt="Doctor profile"
                    width={120}
                  />
                )}
              </section>

              <section className="review-card">
                <h4>Clinic Summary</h4>
                <dl>
                  <dt>Clinic Name</dt>
                  <dd>{clinic.clinicName || '—'}</dd>
                  <dt>Clinic Phone</dt>
                  <dd>{clinic.clinicPhone || '—'}</dd>
                  {clinic.sameAsDoctor ? (
                    <>
                      <dt>Clinic Address</dt>
                      <dd>Same as doctor's address</dd>
                    </>
                  ) : (
                    <>
                      <dt>Clinic Address</dt>
                      <dd>{clinic.address.line1 || '—'}</dd>
                      <dt>Clinic Area</dt>
                      <dd>
                        {clinic.address.block ||
                        clinic.address.district ||
                        clinic.address.state ||
                        clinic.address.pincode
                          ? `${clinic.address.block}, ${clinic.address.district}, ${clinic.address.state} - ${clinic.address.pincode}`
                          : '—'}
                      </dd>
                    </>
                  )}
                </dl>
              </section>
            </div>

            <div className="declaration-block">
              <label className="declaration-row">
                <input
                  type="checkbox"
                  checked={hasAcceptedDeclaration}
                  onChange={e => setHasAcceptedDeclaration(e.target.checked)}
                />
                <span>
                  I hereby declare that the information provided above is true
                  and correct to the best of my knowledge, and I agree to the
                  platform terms and privacy policy.
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="step-actions">
          {currentStep > 1 && (
            <button type="button" onClick={handlePreviousStep}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {currentStep < 4 ? (
            <button type="button" onClick={handleNextStep}>
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={!hasAcceptedDeclaration}>
              <span>Submit</span>
              <Send size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default DoctorRegistration;
