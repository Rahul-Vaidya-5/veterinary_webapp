import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AnimalOwnerRegistration.css';

const ENABLE_STEP_VALIDATION =
  import.meta.env.VITE_ENABLE_STEP_VALIDATION === 'true';

type Address = {
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  state: string;
  district: string;
  block: string;
  pincode: string;
};

const emptyAddress: Address = {
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  state: 'Chhattisgarh',
  district: '',
  block: '',
  pincode: '',
};

type AnimalForm = {
  name: string;
  gender: string;
  dateOfBirth: string;
  breed: string;
  identificationMark: string;
  bloodGroup: string;
  photo: File | null;
};

type OwnerForm = {
  name: string;
  mobile: string;
  address: Address;
};

const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Other',
  'Unknown',
];
const GENDERS = ['Male', 'Female'];
const TOTAL_STEPS = 3;

function AnimalOwnerRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber =
    (location.state as { mobileNumber?: string } | undefined)?.mobileNumber ??
    '';

  const [animal, setAnimal] = useState<AnimalForm>({
    name: '',
    gender: '',
    dateOfBirth: '',
    breed: '',
    identificationMark: '',
    bloodGroup: '',
    photo: null,
  });

  const [owner, setOwner] = useState<OwnerForm>({
    name: '',
    mobile: mobileNumber,
    address: { ...emptyAddress },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [hasAcceptedDeclaration, setHasAcceptedDeclaration] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handleAnimalChange(
    field: keyof Omit<AnimalForm, 'photo'>,
    value: string,
  ) {
    setAnimal(prev => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAnimal(prev => ({ ...prev, photo: file }));
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleOwnerChange(
    field: keyof Omit<OwnerForm, 'address'>,
    value: string,
  ) {
    setOwner(prev => ({ ...prev, [field]: value }));
  }

  function handleOwnerAddressChange(field: keyof Address, value: string) {
    setOwner(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  }

  function validateStep1(): string {
    if (!animal.name.trim()) return 'Animal name is required.';
    if (!animal.gender) return 'Please select a gender.';
    if (!animal.dateOfBirth) return 'Date of birth is required.';
    if (!animal.breed.trim()) return 'Breed is required.';
    if (!animal.bloodGroup) return 'Please select blood group.';
    return '';
  }

  function validateStep2(): string {
    if (!owner.name.trim()) return 'Owner name is required.';
    if (!owner.mobile.trim()) return 'Mobile number is required.';
    if (!/^\d{10}$/.test(owner.mobile.trim()))
      return 'Mobile must be exactly 10 digits.';
    if (!owner.address.addressLine1.trim())
      return 'Address Line 1 is required.';
    if (!owner.address.district.trim()) return 'District is required.';
    if (!owner.address.block.trim()) return 'Block is required.';
    if (!owner.address.state.trim()) return 'State is required.';
    if (!owner.address.pincode.trim()) return 'Pincode is required.';
    if (!/^\d{6}$/.test(owner.address.pincode.trim()))
      return 'Pincode must be exactly 6 digits.';
    return '';
  }

  function handleNextStep() {
    if (ENABLE_STEP_VALIDATION) {
      let error = '';
      if (currentStep === 1) error = validateStep1();
      if (currentStep === 2) error = validateStep2();
      if (error) {
        setStepError(error);
        return;
      }
    }
    setStepError('');
    setCurrentStep(s => s + 1);
  }

  function handlePreviousStep() {
    setStepError('');
    setCurrentStep(s => s - 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasAcceptedDeclaration) return;
    // TODO: replace with API call
    console.log('Animal & Owner registration submit:', { animal, owner });
    navigate('/owner/set-password', {
      replace: true,
      state: { ownerName: owner.name, mobileNumber: owner.mobile },
    });
  }

  return (
    <section className="animal-registration">
      <h2>Animal &amp; Owner Registration</h2>

      <div className="step-meta">
        <span>
          Step {currentStep} of {TOTAL_STEPS}
        </span>
        <div className="step-dots">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`dot ${i + 1 === currentStep ? 'dot-active' : i + 1 < currentStep ? 'dot-done' : ''}`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Step 1: Animal Details ── */}
        {currentStep === 1 && (
          <>
            <h3>Animal Details</h3>

            <label>
              Animal Name *
              <input
                type="text"
                value={animal.name}
                onChange={e => handleAnimalChange('name', e.target.value)}
                placeholder="e.g. Buddy"
              />
            </label>

            <label>
              Gender *
              <select
                value={animal.gender}
                onChange={e => handleAnimalChange('gender', e.target.value)}
              >
                <option value="">-- Select --</option>
                {GENDERS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date of Birth *
              <input
                type="date"
                value={animal.dateOfBirth}
                onChange={e =>
                  handleAnimalChange('dateOfBirth', e.target.value)
                }
              />
            </label>

            <label>
              Breed *
              <input
                type="text"
                value={animal.breed}
                onChange={e => handleAnimalChange('breed', e.target.value)}
                placeholder="e.g. Labrador Retriever"
              />
            </label>

            <label className="full-width">
              Identification Mark (Optional)
              <input
                type="text"
                value={animal.identificationMark}
                onChange={e =>
                  handleAnimalChange('identificationMark', e.target.value)
                }
                placeholder="e.g. White patch on left ear"
              />
            </label>

            <label>
              Blood Group *
              <select
                value={animal.bloodGroup}
                onChange={e => handleAnimalChange('bloodGroup', e.target.value)}
              >
                <option value="">-- Select --</option>
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Animal Photo (Optional)
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Animal photo preview"
                  className="photo-preview"
                />
              )}
            </label>
          </>
        )}

        {/* ── Step 2: Owner Details ── */}
        {currentStep === 2 && (
          <>
            <h3>Owner Details</h3>

            <label>
              Owner Name *
              <input
                type="text"
                value={owner.name}
                onChange={e => handleOwnerChange('name', e.target.value)}
                placeholder="Full name"
              />
            </label>

            <label>
              Mobile *
              <input
                type="tel"
                value={owner.mobile}
                placeholder="10-digit mobile number"
                maxLength={10}
                disabled
                readOnly
              />
            </label>

            <h3 className="section-subheading">Address</h3>

            <label className="full-width">
              Address Line 1 *
              <input
                type="text"
                value={owner.address.addressLine1}
                onChange={e =>
                  handleOwnerAddressChange('addressLine1', e.target.value)
                }
                placeholder="House / Flat No., Street"
              />
            </label>

            <label className="full-width">
              Address Line 2 (Optional)
              <input
                type="text"
                value={owner.address.addressLine2}
                onChange={e =>
                  handleOwnerAddressChange('addressLine2', e.target.value)
                }
                placeholder="Colony, Area"
              />
            </label>

            <label className="full-width">
              Landmark (Optional)
              <input
                type="text"
                value={owner.address.landmark}
                onChange={e =>
                  handleOwnerAddressChange('landmark', e.target.value)
                }
                placeholder="Near school, temple, etc."
              />
            </label>

            <label>
              Pincode *
              <input
                type="text"
                value={owner.address.pincode}
                onChange={e =>
                  handleOwnerAddressChange('pincode', e.target.value)
                }
                maxLength={6}
              />
            </label>

            <label>
              State *
              <input
                type="text"
                value={owner.address.state}
                onChange={e =>
                  handleOwnerAddressChange('state', e.target.value)
                }
              />
            </label>

            <label>
              District *
              <input
                type="text"
                value={owner.address.district}
                onChange={e =>
                  handleOwnerAddressChange('district', e.target.value)
                }
              />
            </label>

            <label>
              Block *
              <input
                type="text"
                value={owner.address.block}
                onChange={e =>
                  handleOwnerAddressChange('block', e.target.value)
                }
              />
            </label>
          </>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {currentStep === 3 && (
          <>
            <h3 className="review-heading">Review and Submit</h3>

            <div className="review-block">
              <div className="review-grid">
                <div className="review-card">
                  <h4>Animal Summary</h4>
                  <dl>
                    <dt>Name</dt>
                    <dd>{animal.name || '—'}</dd>
                    <dt>Gender</dt>
                    <dd>{animal.gender || '—'}</dd>
                    <dt>Date of Birth</dt>
                    <dd>{animal.dateOfBirth || '—'}</dd>
                    <dt>Breed</dt>
                    <dd>{animal.breed || '—'}</dd>
                    <dt>Identification Mark</dt>
                    <dd>{animal.identificationMark || '—'}</dd>
                    <dt>Blood Group</dt>
                    <dd>{animal.bloodGroup || '—'}</dd>
                    <dt>Photo</dt>
                    <dd>{animal.photo ? animal.photo.name : 'Not provided'}</dd>
                  </dl>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Animal photo"
                      className="photo-preview review-photo"
                    />
                  )}
                </div>

                <div className="review-card">
                  <h4>Owner Summary</h4>
                  <dl>
                    <dt>Name</dt>
                    <dd>{owner.name || '—'}</dd>
                    <dt>Mobile</dt>
                    <dd>{owner.mobile || '—'}</dd>
                    <dt>Address Line 1</dt>
                    <dd>{owner.address.addressLine1 || '—'}</dd>
                    {owner.address.addressLine2 && (
                      <>
                        <dt>Address Line 2</dt>
                        <dd>{owner.address.addressLine2}</dd>
                      </>
                    )}
                    {owner.address.landmark && (
                      <>
                        <dt>Landmark</dt>
                        <dd>{owner.address.landmark}</dd>
                      </>
                    )}
                    <dt>District</dt>
                    <dd>{owner.address.district || '—'}</dd>
                    <dt>Block</dt>
                    <dd>{owner.address.block || '—'}</dd>
                    <dt>State</dt>
                    <dd>{owner.address.state || '—'}</dd>
                    <dt>Pincode</dt>
                    <dd>{owner.address.pincode || '—'}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="declaration-block">
              <label className="declaration-row">
                <input
                  type="checkbox"
                  checked={hasAcceptedDeclaration}
                  onChange={e => setHasAcceptedDeclaration(e.target.checked)}
                />
                <span>
                  I declare that the above information is accurate and complete
                  to the best of my knowledge.
                </span>
              </label>
            </div>
          </>
        )}

        {stepError && <p className="form-error">{stepError}</p>}

        <div className="step-actions">
          {currentStep > 1 && (
            <button type="button" onClick={handlePreviousStep}>
              Back
            </button>
          )}
          {currentStep < TOTAL_STEPS && (
            <button type="button" onClick={handleNextStep}>
              Next
            </button>
          )}
          {currentStep === TOTAL_STEPS && (
            <button type="submit" disabled={!hasAcceptedDeclaration}>
              Submit Registration
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default AnimalOwnerRegistration;
