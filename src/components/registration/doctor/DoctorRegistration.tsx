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
  firstName: string;
  lastName: string;
  email: string;
  experience: number;
  dateOfBirth: string;
  mobileNumber: string;
  specialization: string;
  licenseNumber: string;
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
import { useNavigate } from 'react-router-dom';
import './DoctorRegistration.css';

const emptyAddress: Address = {
  line1: '',
  line2: '',
  landmark: '',
  pincode: '',
  block: '',
  district: '',
  state: '',
};

const initialDoctorForm: DoctorForm = {
  firstName: '',
  lastName: '',
  email: '',
  experience: 0,
  dateOfBirth: '',
  mobileNumber: '',
  specialization: '',
  licenseNumber: '',
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
  const ENABLE_STEP_VALIDATION =
    import.meta.env.VITE_ENABLE_STEP_VALIDATION === 'true';
  const [doctor, setDoctor] = useState<DoctorForm>(initialDoctorForm);
  const [clinic, setClinic] = useState<ClinicForm>(initialClinicForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [hasAcceptedDeclaration, setHasAcceptedDeclaration] = useState(false);

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

  function handleClinicPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setClinic(prev => ({
      ...prev,
      clinicPhotoFile: file,
      clinicPhotoUrl: file ? URL.createObjectURL(file) : '',
    }));
  }

  function validateStep1() {
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

  return (
    <div className="doctor-registration">
      <h2>Doctor Registration</h2>
      <p className="step-meta">Step {currentStep} of 4</p>
      {stepError && <p className="form-error">{stepError}</p>}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <>
            <h3>Doctor Basic Details</h3>

            <label>
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
                onChange={e =>
                  handleDoctorChange(
                    'mobileNumber',
                    e.target.value.replace(/[^0-9]/g, ''),
                  )
                }
                maxLength={10}
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
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3>Doctor Address and Signature</h3>

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
              Block *
              <input
                type="text"
                value={doctor.address.block}
                onChange={e =>
                  handleDoctorAddressChange('block', e.target.value)
                }
              />
            </label>
            <label>
              District *
              <input
                type="text"
                value={doctor.address.district}
                onChange={e =>
                  handleDoctorAddressChange('district', e.target.value)
                }
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
              Doctor Signature (Optional)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleDoctorSignatureChange}
              />
            </label>

            {doctor.doctorSignatureUrl && (
              <img
                src={doctor.doctorSignatureUrl}
                alt="Doctor signature preview"
                width={180}
              />
            )}
          </>
        )}

        {currentStep === 3 && (
          <>
            <h3>Clinic Details</h3>

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
              Block *
              <input
                type="text"
                value={clinic.address.block}
                onChange={e =>
                  handleClinicAddressChange('block', e.target.value)
                }
                disabled={clinic.sameAsDoctor}
              />
            </label>

            <label>
              District *
              <input
                type="text"
                value={clinic.address.district}
                onChange={e =>
                  handleClinicAddressChange('district', e.target.value)
                }
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
            <h3>Review and Submit</h3>

            <div className="review-grid">
              <section className="review-card">
                <h4>Doctor Summary</h4>
                <p>
                  <span>Doctor Name</span>
                  <strong>
                    {doctor.firstName} {doctor.lastName}
                  </strong>
                </p>
                <p>
                  <span>Mobile</span>
                  <strong>{doctor.mobileNumber}</strong>
                </p>
                <p>
                  <span>Date of Birth</span>
                  <strong>{doctor.dateOfBirth}</strong>
                </p>
                <p>
                  <span>Experience</span>
                  <strong>{doctor.experience} years</strong>
                </p>
                <p>
                  <span>License Number</span>
                  <strong>{doctor.licenseNumber}</strong>
                </p>
                <p>
                  <span>Address</span>
                  <strong>{doctor.address.line1}</strong>
                </p>
                <p>
                  <span>Area</span>
                  <strong>
                    {doctor.address.block}, {doctor.address.district},{' '}
                    {doctor.address.state} - {doctor.address.pincode}
                  </strong>
                </p>
              </section>

              <section className="review-card">
                <h4>Clinic Summary</h4>
                <p>
                  <span>Clinic Name</span>
                  <strong>{clinic.clinicName}</strong>
                </p>
                <p>
                  <span>Clinic Phone</span>
                  <strong>{clinic.clinicPhone}</strong>
                </p>

                {clinic.sameAsDoctor ? (
                  <p>
                    <span>Clinic Address</span>
                    <strong>Same as doctor's address</strong>
                  </p>
                ) : (
                  <>
                    <p>
                      <span>Clinic Address</span>
                      <strong>{clinic.address.line1}</strong>
                    </p>
                    <p>
                      <span>Clinic Area</span>
                      <strong>
                        {clinic.address.block}, {clinic.address.district},{' '}
                        {clinic.address.state} - {clinic.address.pincode}
                      </strong>
                    </p>
                  </>
                )}
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
              Back
            </button>
          )}

          {currentStep < 4 ? (
            <button type="button" onClick={handleNextStep}>
              Next
            </button>
          ) : (
            <button type="submit" disabled={!hasAcceptedDeclaration}>
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default DoctorRegistration;
