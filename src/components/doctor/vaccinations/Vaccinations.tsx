import { useState, useEffect } from 'react';
import { useStorageScope } from '../../../utils/StorageScope';
import { Syringe, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctorInfo } from '../dashboard/DoctorDashboard';
import SearchableSelectInput from '../../utility/SearchableSelectInput';
import { useSpeciesBreeds } from '../../utility/useSpeciesBreeds';
import { useVaccineMaster } from '../../utility/useVaccineMaster';
import { getIstDateKey, formatIstDate } from '../../../utils/istDateTime';
import './Vaccinations.css';

// ── Types ──────────────────────────────────────────────────────────────────

type VaccinationRecord = {
  id: string;
  certificateNo?: string;
  // Animal
  animalName: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  // Owner
  ownerName: string;
  ownerContact: string;
  // Vaccine
  vaccineName: string;
  vaccineType: 'Core' | 'Non-Core' | '';
  doseNumber: '1st Dose' | '2nd Dose' | '3rd Dose' | 'Booster' | 'Annual' | '';
  routeOfAdmin: 'IM' | 'SC' | 'Oral' | 'Intranasal' | '';
  batchNumber: string;
  manufacturer: string;
  // Dates
  dateAdministered: string;
  nextDueDate: string;
  // Notes
  notes: string;
};

type InventoryVaccine = {
  id: string;
  name: string;
  quantity: number;
  [key: string]: unknown;
};

// ── Constants ──────────────────────────────────────────────────────────────

const LS_KEY = 'vc_vaccination_records';
const LS_INVENTORY = 'vc_vaccinations';
const today = getIstDateKey();
let vaccSlipCounter = Math.floor(Math.random() * 900) + 100;

const DOSE_OPTIONS = ['1st Dose', '2nd Dose', '3rd Dose', 'Booster', 'Annual'];
const ROUTE_OPTIONS = ['IM', 'SC', 'Oral', 'Intranasal'];
const VACCINE_TYPE_OPTIONS = ['Core', 'Non-Core'];

// ── Helpers ────────────────────────────────────────────────────────────────

const loadRecords = (key: string): VaccinationRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  } catch {
    return [];
  }
};

const loadInventory = (): InventoryVaccine[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_INVENTORY) ?? '[]');
  } catch {
    return [];
  }
};

const deductInventory = (vaccineName: string) => {
  const inv = loadInventory();
  const idx = inv.findIndex(
    v => v.name.trim().toLowerCase() === vaccineName.trim().toLowerCase(),
  );
  if (idx === -1 || inv[idx].quantity <= 0) return;
  inv[idx] = { ...inv[idx], quantity: inv[idx].quantity - 1 };
  localStorage.setItem(LS_INVENTORY, JSON.stringify(inv));
};

const emptyForm = (): Omit<VaccinationRecord, 'id'> => ({
  animalName: '',
  species: '',
  breed: '',
  age: '',
  weight: '',
  ownerName: '',
  ownerContact: '',
  vaccineName: '',
  vaccineType: '',
  doseNumber: '',
  routeOfAdmin: '',
  batchNumber: '',
  manufacturer: '',
  dateAdministered: today,
  nextDueDate: '',
  notes: '',
});

const fmt = (d: string) => {
  if (!d) return '—';
  return formatIstDate(new Date(d + 'T00:00:00'), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const isOverdue = (r: VaccinationRecord) =>
  r.nextDueDate && r.nextDueDate < today;

// ── Component ──────────────────────────────────────────────────────────────

function Vaccinations() {
  const navigate = useNavigate();
  const { doctorName } = useDoctorInfo();
  const storagePrefix = useStorageScope();
  const lsKey = storagePrefix + LS_KEY;
  const { speciesNames, getBreedsForSpecies } = useSpeciesBreeds();
  const { vaccineOptions, addVaccine } = useVaccineMaster();

  const [records, setRecords] = useState<VaccinationRecord[]>(() =>
    loadRecords(lsKey),
  );
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [printRecord, setPrintRecord] = useState<VaccinationRecord | null>(
    null,
  );

  useEffect(() => {
    localStorage.setItem(lsKey, JSON.stringify(records));
  }, [records, lsKey]);

  const breedOptions = getBreedsForSpecies(form.species);

  // Animal history — match by name (2+ chars), refine further by owner if provided
  const animalHistory: VaccinationRecord[] = (() => {
    const name = form.animalName.trim().toLowerCase();
    if (name.length < 2) return [];
    const owner = form.ownerName.trim().toLowerCase();
    return records
      .filter(r => {
        const nameMatch = r.animalName.trim().toLowerCase() === name;
        if (!nameMatch) return false;
        if (owner.length >= 2)
          return r.ownerName.trim().toLowerCase().includes(owner);
        return true;
      })
      .sort((a, b) => b.dateAdministered.localeCompare(a.dateAdministered));
  })();

  // Check inventory stock for the selected vaccine
  useEffect(() => {
    if (!form.vaccineName.trim()) {
      setStockWarning(null);
      return;
    }
    const inv = loadInventory();
    const match = inv.find(
      v =>
        v.name.trim().toLowerCase() === form.vaccineName.trim().toLowerCase(),
    );
    if (!match) {
      setStockWarning('This vaccine is not in your inventory.');
    } else if (match.quantity <= 0) {
      setStockWarning('Stock exhausted for this vaccine!');
    } else if (match.quantity <= 5) {
      setStockWarning(`Low stock: only ${match.quantity} dose(s) remaining.`);
    } else {
      setStockWarning(null);
    }
  }, [form.vaccineName]);

  const set = (field: keyof Omit<VaccinationRecord, 'id'>, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => {
      const n = { ...e };
      delete n[field];
      return n;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.animalName.trim()) e.animalName = 'Required';
    if (!form.species.trim()) e.species = 'Required';
    if (!form.ownerName.trim()) e.ownerName = 'Required';
    if (!form.vaccineName.trim()) e.vaccineName = 'Required';
    if (!form.dateAdministered) e.dateAdministered = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addVaccine(form.vaccineName);
    deductInventory(form.vaccineName);
    const certificateNo = `VAC-${today.slice(0, 4)}-${++vaccSlipCounter}`;
    const newRecord: VaccinationRecord = {
      ...form,
      id: `vacc-rec-${Date.now()}`,
      certificateNo,
    };
    setRecords(prev => [newRecord, ...prev]);
    setPrintRecord(newRecord);
    setForm(emptyForm());
    setErrors({});
    setStockWarning(null);

    // Wait a tick so the print-only certificate renders before triggering print.
    setTimeout(() => {
      window.print();
      window.alert(
        'Vaccination slip generated successfully. Redirecting to current appointments.',
      );
      navigate('../appointments');
    }, 80);
  };

  return (
    <div className="vacc-page">
      <div className="no-print">
        {/* ── Page header ── */}
        <div className="vacc-page-header">
          <h1 className="dash-page-title">
            <Syringe size={22} /> Vaccinations
          </h1>
        </div>

        {/* ── Form ── */}
        <div className="vacc-form-card dash-card">
          <h2 className="vacc-form-title">Record New Vaccination</h2>

          {/* Animal */}
          <section className="vacc-section">
            <h3 className="vacc-section-title">Animal Details</h3>
            <div className="vacc-grid">
              <label className={errors.animalName ? 'error' : ''}>
                Animal Name *
                <input
                  value={form.animalName}
                  onChange={e => set('animalName', e.target.value)}
                  placeholder="e.g. Bruno"
                />
                {errors.animalName && (
                  <span className="err-msg">{errors.animalName}</span>
                )}
              </label>
              <label className={errors.species ? 'error' : ''}>
                Species *
                <SearchableSelectInput
                  inputId="vacc-species"
                  listId="vacc-species-list"
                  value={form.species}
                  onChange={value => {
                    setForm(f => ({ ...f, species: value, breed: '' }));
                    setErrors(e => {
                      const n = { ...e };
                      delete n.species;
                      return n;
                    });
                  }}
                  options={speciesNames}
                  placeholder="Search or type species"
                  allowCustom
                />
                {errors.species && (
                  <span className="err-msg">{errors.species}</span>
                )}
              </label>
              <label>
                Breed
                <SearchableSelectInput
                  inputId="vacc-breed"
                  listId="vacc-breed-list"
                  value={form.breed}
                  onChange={value => set('breed', value)}
                  options={breedOptions}
                  placeholder={
                    form.species.trim()
                      ? 'Search or type breed'
                      : 'Select species first'
                  }
                  disabled={!form.species.trim()}
                  allowCustom
                />
              </label>
              <label>
                Age
                <input
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                  placeholder="e.g. 2 years"
                />
              </label>
              <label>
                Weight (kg)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weight}
                  onChange={e => set('weight', e.target.value)}
                  placeholder="e.g. 8.5"
                />
              </label>
            </div>
          </section>

          {/* Owner */}
          <section className="vacc-section">
            <h3 className="vacc-section-title">Owner Details</h3>
            <div className="vacc-grid">
              <label className={errors.ownerName ? 'error' : ''}>
                Owner Name *
                <input
                  value={form.ownerName}
                  onChange={e => set('ownerName', e.target.value)}
                  placeholder="Owner's full name"
                />
                {errors.ownerName && (
                  <span className="err-msg">{errors.ownerName}</span>
                )}
              </label>
              <label>
                Contact Number
                <input
                  value={form.ownerContact}
                  onChange={e => set('ownerContact', e.target.value)}
                  placeholder="Mobile number"
                />
              </label>
            </div>
          </section>

          {/* ── Animal History ── */}
          {animalHistory.length > 0 && (
            <section className="vacc-history-panel">
              <h3 className="vacc-history-title">
                <RefreshCw size={14} />
                Vaccination history for {form.animalName}
                <span className="vacc-history-count">
                  {animalHistory.length} record
                  {animalHistory.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <div className="vacc-history-list">
                {animalHistory.map(r => {
                  const overdue = isOverdue(r);
                  return (
                    <div
                      key={r.id}
                      className={`vacc-history-row${overdue ? ' overdue' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(`../history?type=vaccination&id=${r.id}`)
                      }
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`../history?type=vaccination&id=${r.id}`);
                          navigate('../appointments');
                        }
                      }}
                    >
                      <span className="vacc-history-date">
                        {fmt(r.dateAdministered)}
                      </span>
                      <span className="vacc-history-vaccine">
                        <Syringe size={11} /> {r.vaccineName}
                      </span>
                      {r.doseNumber && (
                        <span className="vacc-meta-chip vacc-dose-chip">
                          {r.doseNumber}
                        </span>
                      )}
                      {r.routeOfAdmin && (
                        <span className="vacc-meta-chip">{r.routeOfAdmin}</span>
                      )}
                      {r.nextDueDate ? (
                        <span
                          className={`vacc-history-due${overdue ? ' overdue' : ''}`}
                        >
                          {overdue ? '⚠ Overdue' : 'Due'}: {fmt(r.nextDueDate)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Vaccine */}
          <section className="vacc-section">
            <h3 className="vacc-section-title">Vaccine Details</h3>
            {stockWarning && (
              <div className="vacc-stock-warning">
                <AlertTriangle size={14} />
                {stockWarning}
              </div>
            )}
            <div className="vacc-grid">
              <label className={errors.vaccineName ? 'error' : ''}>
                Vaccine Name *
                <SearchableSelectInput
                  inputId="vacc-name"
                  listId="vacc-name-list"
                  value={form.vaccineName}
                  onChange={value => set('vaccineName', value)}
                  options={vaccineOptions}
                  placeholder="Search or type vaccine"
                  allowCustom
                />
                {errors.vaccineName && (
                  <span className="err-msg">{errors.vaccineName}</span>
                )}
              </label>
              <label>
                Vaccine Type
                <select
                  value={form.vaccineType}
                  onChange={e => set('vaccineType', e.target.value)}
                >
                  <option value="">Select type</option>
                  {VACCINE_TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dose Number
                <select
                  value={form.doseNumber}
                  onChange={e => set('doseNumber', e.target.value)}
                >
                  <option value="">Select dose</option>
                  {DOSE_OPTIONS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Route of Administration
                <select
                  value={form.routeOfAdmin}
                  onChange={e => set('routeOfAdmin', e.target.value)}
                >
                  <option value="">Select route</option>
                  {ROUTE_OPTIONS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Batch / Lot Number
                <input
                  value={form.batchNumber}
                  onChange={e => set('batchNumber', e.target.value)}
                  placeholder="e.g. B2024-001"
                />
              </label>
              <label>
                Manufacturer
                <input
                  value={form.manufacturer}
                  onChange={e => set('manufacturer', e.target.value)}
                  placeholder="e.g. Zoetis, MSD"
                />
              </label>
            </div>
            <div className="vacc-grid vacc-grid-dates">
              <label className={errors.dateAdministered ? 'error' : ''}>
                Date Administered *
                <input
                  type="date"
                  value={form.dateAdministered}
                  onChange={e => set('dateAdministered', e.target.value)}
                  max={today}
                />
                {errors.dateAdministered && (
                  <span className="err-msg">{errors.dateAdministered}</span>
                )}
              </label>
              <label>
                Next Due Date
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={e => set('nextDueDate', e.target.value)}
                  min={today}
                />
              </label>
              <label className="vacc-notes-label">
                Notes
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Reaction observed, special instructions…"
                />
              </label>
            </div>
          </section>

          <div className="vacc-form-actions">
            <button
              type="button"
              className="btn-vacc-save"
              onClick={handleSave}
            >
              <Syringe size={15} /> Save Record &amp; Print Slip
            </button>
          </div>
        </div>
      </div>

      {/* ── Printable Vaccination Slip ── */}
      <div className="vacc-slip-view print-only">
        {printRecord && (
          <>
            <div className="vacc-slip-header">
              <div>
                <h1>Vaccination Certificate</h1>
                <p>Veterinary Clinic Record</p>
              </div>
              <div className="vacc-slip-meta">
                <p>
                  <strong>Certificate No:</strong>{' '}
                  {printRecord.certificateNo || '—'}
                </p>
                <p>
                  <strong>Date:</strong> {fmt(printRecord.dateAdministered)}
                </p>
              </div>
            </div>

            <hr className="vacc-slip-divider" />

            <table className="vacc-slip-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Animal Name:</strong> {printRecord.animalName}
                  </td>
                  <td>
                    <strong>Species:</strong> {printRecord.species}
                  </td>
                  <td>
                    <strong>Breed:</strong> {printRecord.breed || '—'}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Age:</strong> {printRecord.age || '—'}
                  </td>
                  <td>
                    <strong>Weight:</strong>{' '}
                    {printRecord.weight ? `${printRecord.weight} kg` : '—'}
                  </td>
                  <td>
                    <strong>Owner:</strong> {printRecord.ownerName}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Contact:</strong> {printRecord.ownerContact || '—'}
                  </td>
                  <td>
                    <strong>Vaccine Type:</strong>{' '}
                    {printRecord.vaccineType || '—'}
                  </td>
                  <td>
                    <strong>Dose:</strong> {printRecord.doseNumber || '—'}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Vaccine:</strong> {printRecord.vaccineName}
                  </td>
                  <td>
                    <strong>Route:</strong> {printRecord.routeOfAdmin || '—'}
                  </td>
                  <td>
                    <strong>Manufacturer:</strong>{' '}
                    {printRecord.manufacturer || '—'}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Batch/Lot:</strong> {printRecord.batchNumber || '—'}
                  </td>
                  <td>
                    <strong>Administered On:</strong>{' '}
                    {fmt(printRecord.dateAdministered)}
                  </td>
                  <td>
                    <strong>Next Due:</strong> {fmt(printRecord.nextDueDate)}
                  </td>
                </tr>
              </tbody>
            </table>

            {printRecord.notes && (
              <div className="vacc-slip-notes">
                <strong>Notes:</strong> {printRecord.notes}
              </div>
            )}

            <div className="vacc-slip-sign">
              <div className="vacc-sign-line" />
              <p>Dr. {doctorName}</p>
              <p>Veterinary Physician</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Vaccinations;
