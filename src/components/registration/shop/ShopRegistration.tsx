import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Store,
  UserRound,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Send,
} from 'lucide-react';
import SearchableSelectInput from '../../utility/SearchableSelectInput';
import { useChhattisgarhLocations } from '../../utility/useChhattisgarhLocations';
import './ShopRegistration.css';

const ENABLE_STEP_VALIDATION =
  import.meta.env.VITE_ENABLE_STEP_VALIDATION === 'true';

type Address = {
  line1: string;
  line2: string;
  landmark: string;
  state: string;
  district: string;
  block: string;
  pincode: string;
};

type ShopType = 'medical' | 'animal-food' | 'both' | '';

type ShopForm = {
  shopType: ShopType;
  shopName: string;
  registrationNumber: string;
  address: Address;
  imageFile: File | null;
  imageUrl: string;
};

type OwnerForm = {
  name: string;
  mobileNumber: string;
  pharmacyLicense: string;
};

const emptyAddress: Address = {
  line1: '',
  line2: '',
  landmark: '',
  state: 'Chhattisgarh',
  district: '',
  block: '',
  pincode: '',
};

const TOTAL_STEPS = 3;

function ShopRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber =
    (location.state as { mobileNumber?: string } | undefined)?.mobileNumber ??
    '';

  const [shop, setShop] = useState<ShopForm>({
    shopType: '',
    shopName: '',
    registrationNumber: '',
    address: { ...emptyAddress },
    imageFile: null,
    imageUrl: '',
  });

  const [owner, setOwner] = useState<OwnerForm>({
    name: '',
    mobileNumber,
    pharmacyLicense: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [hasAcceptedDeclaration, setHasAcceptedDeclaration] = useState(false);
  const { districtNames, getBlocksForDistrict, isKnownDistrict, isKnownBlock } =
    useChhattisgarhLocations();

  const shopBlockOptions = getBlocksForDistrict(shop.address.district);

  const requiresPharmacyLicense =
    shop.shopType === 'medical' || shop.shopType === 'both';

  function handleShopChange<K extends keyof Omit<ShopForm, 'address'>>(
    field: K,
    value: ShopForm[K],
  ) {
    setShop(prev => ({ ...prev, [field]: value }));
  }

  function handleAddressChange<K extends keyof Address>(
    field: K,
    value: Address[K],
  ) {
    setShop(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...(field === 'district' ? { block: '' } : {}),
        [field]: value,
      },
    }));
  }

  function handleOwnerChange<K extends keyof OwnerForm>(
    field: K,
    value: OwnerForm[K],
  ) {
    setOwner(prev => ({ ...prev, [field]: value }));
  }

  function handleShopImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setShop(prev => ({
      ...prev,
      imageFile: file,
      imageUrl: file ? URL.createObjectURL(file) : '',
    }));
  }

  function validateStep1(): string {
    if (!shop.shopType) return 'Please select shop type.';
    if (!shop.shopName.trim()) return 'Shop name is required.';
    if (!shop.registrationNumber.trim())
      return 'Shop registration number is required.';
    if (requiresPharmacyLicense && !owner.pharmacyLicense.trim()) {
      return 'Pharmacy licence number is required for medical or both shop types.';
    }
    if (!shop.address.line1.trim()) return 'Shop address line 1 is required.';
    if (!shop.address.state.trim()) return 'State is required.';
    if (!shop.address.district.trim()) return 'District is required.';
    if (!shop.address.block.trim()) return 'Block is required.';
    if (districtNames.length > 0 && !isKnownDistrict(shop.address.district)) {
      return 'Select a valid district from the list.';
    }
    if (
      districtNames.length > 0 &&
      !isKnownBlock(shop.address.district, shop.address.block)
    ) {
      return 'Select a valid block from the list.';
    }
    if (!shop.address.pincode.trim()) return 'Pincode is required.';
    if (!/^\d{6}$/.test(shop.address.pincode.trim()))
      return 'Pincode must be exactly 6 digits.';
    return '';
  }

  function validateStep2(): string {
    if (!owner.name.trim()) return 'Owner name is required.';
    if (!owner.mobileNumber.trim()) return 'Owner mobile number is required.';
    if (!/^\d{10}$/.test(owner.mobileNumber.trim()))
      return 'Owner mobile must be exactly 10 digits.';
    return '';
  }

  function handleNextStep() {
    if (ENABLE_STEP_VALIDATION) {
      const error = currentStep === 1 ? validateStep1() : validateStep2();
      if (error) {
        setStepError(error);
        return;
      }
    }

    setStepError('');
    setCurrentStep(prev => prev + 1);
  }

  function handlePreviousStep() {
    setStepError('');
    setCurrentStep(prev => prev - 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAcceptedDeclaration) return;
    if (requiresPharmacyLicense && !owner.pharmacyLicense.trim()) {
      setStepError(
        'Pharmacy licence number is required for medical or both shop types.',
      );
      return;
    }

    setStepError('');

    // TODO: replace with API call
    console.log('Shop registration submit', { shop, owner });

    navigate('/shop/set-password', {
      replace: true,
      state: {
        ownerName: owner.name,
        mobileNumber: owner.mobileNumber,
        shopName: shop.shopName,
      },
    });
  }

  return (
    <section className="shop-registration">
      <h2>Medical / Animal Food Shop Registration</h2>

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

      <form onSubmit={handleSubmit} noValidate>
        {currentStep === 1 && (
          <>
            <h3 className="step-heading">
              <Store size={18} />
              <span>Shop Details</span>
            </h3>

            <label>
              Shop Type *
              <select
                value={shop.shopType}
                onChange={e =>
                  handleShopChange('shopType', e.target.value as ShopType)
                }
              >
                <option value="">-- Select --</option>
                <option value="medical">Medical Store</option>
                <option value="animal-food">Animal Food Shop</option>
                <option value="both">Both</option>
              </select>
            </label>

            <label>
              Shop Name *
              <input
                type="text"
                value={shop.shopName}
                onChange={e => handleShopChange('shopName', e.target.value)}
              />
            </label>

            <label>
              Shop Registration Number *
              <input
                type="text"
                value={shop.registrationNumber}
                onChange={e =>
                  handleShopChange('registrationNumber', e.target.value)
                }
              />
            </label>

            {requiresPharmacyLicense && (
              <label>
                Pharmacy Licence Number *
                <input
                  type="text"
                  value={owner.pharmacyLicense}
                  onChange={e =>
                    handleOwnerChange('pharmacyLicense', e.target.value)
                  }
                  placeholder="Enter pharmacy licence number"
                />
              </label>
            )}

            <label className="full-width">
              Shop Address Line 1 *
              <input
                type="text"
                value={shop.address.line1}
                onChange={e => handleAddressChange('line1', e.target.value)}
              />
            </label>

            <label className="full-width">
              Shop Address Line 2 (Optional)
              <input
                type="text"
                value={shop.address.line2}
                onChange={e => handleAddressChange('line2', e.target.value)}
              />
            </label>

            <label className="full-width">
              Landmark (Optional)
              <input
                type="text"
                value={shop.address.landmark}
                onChange={e => handleAddressChange('landmark', e.target.value)}
              />
            </label>

            <label>
              State *
              <input
                type="text"
                value={shop.address.state}
                onChange={e => handleAddressChange('state', e.target.value)}
              />
            </label>

            <label>
              District *
              <SearchableSelectInput
                inputId="shop-district"
                listId="shop-district-list"
                value={shop.address.district}
                onChange={value => handleAddressChange('district', value)}
                options={districtNames}
                placeholder="Search and select district"
              />
            </label>

            <label>
              Block *
              <SearchableSelectInput
                inputId="shop-block"
                listId="shop-block-list"
                value={shop.address.block}
                onChange={value => handleAddressChange('block', value)}
                options={shopBlockOptions}
                placeholder={
                  shop.address.district
                    ? 'Search and select block'
                    : 'Select district first'
                }
                disabled={!shop.address.district.trim()}
              />
            </label>

            <label>
              Pincode *
              <input
                type="text"
                maxLength={6}
                value={shop.address.pincode}
                onChange={e =>
                  handleAddressChange(
                    'pincode',
                    e.target.value.replace(/[^0-9]/g, ''),
                  )
                }
              />
            </label>

            <label className="full-width">
              Shop Image (Optional)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleShopImageChange}
              />
            </label>

            {shop.imageUrl && (
              <img
                src={shop.imageUrl}
                alt="Shop preview"
                className="shop-image-preview"
              />
            )}
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3 className="step-heading">
              <UserRound size={18} />
              <span>Shop Owner Details</span>
            </h3>

            <label>
              Owner Name *
              <input
                type="text"
                value={owner.name}
                onChange={e => handleOwnerChange('name', e.target.value)}
              />
            </label>

            <label>
              Mobile Number *
              <input
                type="tel"
                maxLength={10}
                value={owner.mobileNumber}
                disabled
                readOnly
              />
            </label>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h3 className="review-heading step-heading">
              <ClipboardCheck size={18} />
              <span>Review and Submit</span>
            </h3>

            <div className="review-block">
              <div className="review-grid">
                <section className="review-card">
                  <h4>Shop Summary</h4>
                  <dl>
                    <dt>Shop Type</dt>
                    <dd>
                      {shop.shopType === 'medical'
                        ? 'Medical Store'
                        : shop.shopType === 'animal-food'
                          ? 'Animal Food Shop'
                          : shop.shopType === 'both'
                            ? 'Both'
                            : '—'}
                    </dd>
                    <dt>Shop Name</dt>
                    <dd>{shop.shopName || '—'}</dd>
                    <dt>Registration Number</dt>
                    <dd>{shop.registrationNumber || '—'}</dd>
                    <dt>Address Line 1</dt>
                    <dd>{shop.address.line1 || '—'}</dd>
                    {shop.address.line2 && (
                      <>
                        <dt>Address Line 2</dt>
                        <dd>{shop.address.line2}</dd>
                      </>
                    )}
                    {shop.address.landmark && (
                      <>
                        <dt>Landmark</dt>
                        <dd>{shop.address.landmark}</dd>
                      </>
                    )}
                    <dt>State</dt>
                    <dd>{shop.address.state || '—'}</dd>
                    <dt>District</dt>
                    <dd>{shop.address.district || '—'}</dd>
                    <dt>Block</dt>
                    <dd>{shop.address.block || '—'}</dd>
                    <dt>Pincode</dt>
                    <dd>{shop.address.pincode || '—'}</dd>
                    <dt>Shop Image</dt>
                    <dd>
                      {shop.imageFile ? shop.imageFile.name : 'Not provided'}
                    </dd>
                  </dl>
                  {shop.imageUrl && (
                    <img
                      src={shop.imageUrl}
                      alt="Shop review"
                      className="shop-image-preview review-image"
                    />
                  )}
                </section>

                <section className="review-card">
                  <h4>Owner Summary</h4>
                  <dl>
                    <dt>Name</dt>
                    <dd>{owner.name || '—'}</dd>
                    <dt>Mobile Number</dt>
                    <dd>{owner.mobileNumber || '—'}</dd>
                    {requiresPharmacyLicense && (
                      <>
                        <dt>Pharmacy Licence Number</dt>
                        <dd>{owner.pharmacyLicense || '—'}</dd>
                      </>
                    )}
                  </dl>
                </section>
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

        <div className="step-actions">
          {currentStep > 1 && (
            <button type="button" onClick={handlePreviousStep}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <button type="button" onClick={handleNextStep}>
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={!hasAcceptedDeclaration}>
              <span>Submit Registration</span>
              <Send size={16} />
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default ShopRegistration;
