import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Trash2, Printer, Syringe } from 'lucide-react';
import { useDoctorInfo } from '../dashboard/DoctorDashboard';
import SearchableSelectInput from '../../utility/SearchableSelectInput';
import { useDiagnosisMaster } from '../../utility/useDiagnosisMaster';
import { useSpeciesBreeds } from '../../utility/useSpeciesBreeds';
import './Prescriptions.css';
import { formatIstDate, getIstDateKey } from '../../../utils/istDateTime';

type MedicineRow = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type PrescriptionForm = {
  // Animal details
  animalName: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  height: string;
  // Owner
  ownerName: string;
  ownerContact: string;
  // Medical
  diagnosis: string;
  symptoms: string;
  duration: string;
  // Treatment
  medicines: MedicineRow[];
  pathologyTests: string;
  precautions: string;
  nextVisit: string;
  // Meta
  prescriptionDate: string;
};

type PrescriptionPrefill = Partial<PrescriptionForm>;

type PrescriptionHistoryRecord = PrescriptionForm & {
  id: string;
  rxNo: string;
  createdAt: string;
  doctorName: string;
};

const LS_PRESCRIPTIONS = 'vc_prescriptions';

// ── Vaccination history (read-only reference) ──────────────────────────────
type VaccinationRecord = {
  id: string;
  animalName: string;
  ownerName: string;
  species: string;
  vaccineName: string;
  doseNumber: string;
  routeOfAdmin: string;
  dateAdministered: string;
  nextDueDate: string;
};

const loadVaccRecords = (): VaccinationRecord[] => {
  try {
    return JSON.parse(localStorage.getItem('vc_vaccination_records') ?? '[]');
  } catch {
    return [];
  }
};

const fmtVaccDate = (d: string) => {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const loadPrescriptionHistory = (): PrescriptionHistoryRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_PRESCRIPTIONS) ?? '[]');
  } catch {
    return [];
  }
};

const savePrescriptionHistory = (records: PrescriptionHistoryRecord[]) => {
  localStorage.setItem(LS_PRESCRIPTIONS, JSON.stringify(records));
};

const today = getIstDateKey();

const emptyMedicine = (id: number): MedicineRow => ({
  id,
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
});

let rxCounter = Math.floor(Math.random() * 900) + 100;

function Prescriptions() {
  const navigate = useNavigate();
  const { doctorName } = useDoctorInfo();
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const { speciesNames, getBreedsForSpecies } = useSpeciesBreeds();
  const { diagnosisOptions, addDiagnosis } = useDiagnosisMaster();

  const [form, setForm] = useState<PrescriptionForm>({
    animalName: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    height: '',
    ownerName: '',
    ownerContact: '',
    diagnosis: '',
    symptoms: '',
    duration: '',
    medicines: [emptyMedicine(1)],
    pathologyTests: '',
    precautions: '',
    nextVisit: '',
    prescriptionDate: today,
  });

  const [rxNo] = useState(`RX-${today.slice(0, 4)}-${++rxCounter}`);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const breedOptions = getBreedsForSpecies(form.species);

  const animalDiagnosisHistory: PrescriptionHistoryRecord[] = (() => {
    const name = form.animalName.trim().toLowerCase();
    if (name.length < 2) return [];
    const owner = form.ownerName.trim().toLowerCase();
    return loadPrescriptionHistory()
      .filter(record => {
        const nameMatch = record.animalName.trim().toLowerCase() === name;
        if (!nameMatch) return false;
        if (owner.length >= 2) {
          return record.ownerName.trim().toLowerCase().includes(owner);
        }
        return true;
      })
      .sort((a, b) => {
        const aDate = a.prescriptionDate || a.createdAt.slice(0, 10);
        const bDate = b.prescriptionDate || b.createdAt.slice(0, 10);
        return bDate.localeCompare(aDate);
      });
  })();

  // Vaccination history for the current animal (2+ chars in name)
  const animalVaccHistory: VaccinationRecord[] = (() => {
    const name = form.animalName.trim().toLowerCase();
    if (name.length < 2) return [];
    const owner = form.ownerName.trim().toLowerCase();
    return loadVaccRecords()
      .filter(r => {
        const nameMatch = r.animalName.trim().toLowerCase() === name;
        if (!nameMatch) return false;
        if (owner.length >= 2)
          return r.ownerName.trim().toLowerCase().includes(owner);
        return true;
      })
      .sort((a, b) => b.dateAdministered.localeCompare(a.dateAdministered));
  })();

  useEffect(() => {
    const prefill = (location.state as { prefill?: PrescriptionPrefill } | null)
      ?.prefill;

    if (!prefill) {
      return;
    }

    setForm(currentForm => ({
      ...currentForm,
      ...prefill,
      medicines: currentForm.medicines.length
        ? currentForm.medicines
        : [emptyMedicine(1)],
    }));
  }, [location.state]);

  const set = (field: keyof PrescriptionForm, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => {
      const n = { ...e };
      delete n[field];
      return n;
    });
  };

  const addMedicine = () => {
    setForm(f => ({
      ...f,
      medicines: [...f.medicines, emptyMedicine(Date.now())],
    }));
  };

  const removeMedicine = (id: number) => {
    setForm(f => ({
      ...f,
      medicines:
        f.medicines.length > 1
          ? f.medicines.filter(m => m.id !== id)
          : f.medicines,
    }));
  };

  const updateMedicine = (
    id: number,
    field: keyof Omit<MedicineRow, 'id'>,
    val: string,
  ) => {
    setForm(f => ({
      ...f,
      medicines: f.medicines.map(m =>
        m.id === id ? { ...m, [field]: val } : m,
      ),
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.animalName.trim()) e.animalName = 'Required';
    if (!form.species.trim()) e.species = 'Required';
    if (!form.ownerName.trim()) e.ownerName = 'Required';
    if (!form.diagnosis.trim()) e.diagnosis = 'Required';
    if (!form.symptoms.trim()) e.symptoms = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePrint = () => {
    if (!validate()) return;

    const record: PrescriptionHistoryRecord = {
      ...form,
      id: `rx-${Date.now()}`,
      rxNo,
      createdAt: new Date().toISOString(),
      doctorName,
    };
    const history = loadPrescriptionHistory();
    const withoutCurrentRx = history.filter(r => r.rxNo !== rxNo);
    savePrescriptionHistory([record, ...withoutCurrentRx]);

    window.print();
    window.alert(
      'Prescription slip generated successfully. Redirecting to current appointments.',
    );
    navigate('/doctor/dashboard/appointments');
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return formatIstDate(dt, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="prescriptions-page">
      {/* ── Form (hidden on print) ── */}
      <div className="rx-form no-print">
        <h1 className="dash-page-title">
          <ClipboardList size={22} /> New Prescription
        </h1>

        {/* Section: Animal Details */}
        <section className="rx-section dash-card">
          <h2 className="rx-section-title">Patient (Animal) Details</h2>
          <div className="rx-grid rx-grid-animal">
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
                inputId="prescription-species"
                listId="prescription-species-list"
                value={form.species}
                onChange={value => {
                  setForm(current => ({
                    ...current,
                    species: value,
                    breed: '',
                  }));
                  setErrors(currentErrors => {
                    const nextErrors = { ...currentErrors };
                    delete nextErrors.species;
                    return nextErrors;
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
                inputId="prescription-breed"
                listId="prescription-breed-list"
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
                placeholder="e.g. 3 years"
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
                placeholder="e.g. 12.5"
              />
            </label>
            <label>
              Height (cm)
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.height}
                onChange={e => set('height', e.target.value)}
                placeholder="e.g. 45"
              />
            </label>
          </div>
        </section>

        {/* Section: Owner Details */}
        <section className="rx-section dash-card">
          <h2 className="rx-section-title">Owner Details</h2>
          <div className="rx-grid">
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

        {/* Section: Patient History Reference (reference, no-print) */}
        {(animalDiagnosisHistory.length > 0 ||
          animalVaccHistory.length > 0) && (
          <section className="rx-section dash-card no-print">
            <h2 className="rx-section-title">Patient History Reference</h2>
            <div className="rx-history-columns">
              <div className="rx-history-card">
                <div className="rx-history-card-head diagnosis">
                  <h3>
                    <ClipboardList size={15} /> Diagnosis History
                  </h3>
                  <span className="rx-history-count">
                    {Math.min(animalDiagnosisHistory.length, 3)} of{' '}
                    {animalDiagnosisHistory.length}
                  </span>
                </div>
                {animalDiagnosisHistory.length > 0 ? (
                  <div className="rx-diagnosis-history-list">
                    {animalDiagnosisHistory.slice(0, 3).map(record => (
                      <div
                        key={record.id}
                        className="rx-diagnosis-history-row"
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          navigate(
                            `/doctor/dashboard/history?type=prescription&id=${record.id}`,
                          )
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(
                              `/doctor/dashboard/history?type=prescription&id=${record.id}`,
                            );
                          }
                        }}
                      >
                        <span className="rx-history-date">
                          {fmtVaccDate(
                            record.prescriptionDate ||
                              record.createdAt.slice(0, 10),
                          )}
                        </span>
                        <span className="rx-diagnosis-name">
                          {record.diagnosis || 'Diagnosis not specified'}
                        </span>
                        {record.symptoms && (
                          <span className="rx-history-chip subtle">
                            Symptoms
                          </span>
                        )}
                        <span className="rx-history-ref">{record.rxNo}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rx-history-empty">
                    No previous diagnosis records.
                  </p>
                )}
              </div>

              <div className="rx-history-card">
                <div className="rx-history-card-head vaccination">
                  <h3>
                    <Syringe size={15} /> Vaccination History
                  </h3>
                  <span className="rx-history-count">
                    {Math.min(animalVaccHistory.length, 3)} of{' '}
                    {animalVaccHistory.length}
                  </span>
                </div>
                {animalVaccHistory.length > 0 ? (
                  <div className="rx-vacc-history-list">
                    {animalVaccHistory.slice(0, 3).map(r => {
                      const overdue = r.nextDueDate && r.nextDueDate < today;
                      return (
                        <div
                          key={r.id}
                          className={`rx-vacc-history-row${overdue ? ' overdue' : ''}`}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            navigate(
                              `/doctor/dashboard/history?type=vaccination&id=${r.id}`,
                            )
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(
                                `/doctor/dashboard/history?type=vaccination&id=${r.id}`,
                              );
                            }
                          }}
                        >
                          <span className="rx-vacc-date">
                            {fmtVaccDate(r.dateAdministered)}
                          </span>
                          <span className="rx-vacc-name">
                            <Syringe size={11} /> {r.vaccineName}
                          </span>
                          {r.doseNumber && (
                            <span className="rx-vacc-chip">{r.doseNumber}</span>
                          )}
                          {r.routeOfAdmin && (
                            <span className="rx-vacc-chip">
                              {r.routeOfAdmin}
                            </span>
                          )}
                          {r.nextDueDate && (
                            <span
                              className={`rx-vacc-due${overdue ? ' overdue' : ''}`}
                            >
                              {overdue ? '⚠ Overdue' : 'Due'}:{' '}
                              {fmtVaccDate(r.nextDueDate)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rx-history-empty">No vaccination records.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Section: Medical Info */}
        <section className="rx-section dash-card">
          <h2 className="rx-section-title">Medical Information</h2>
          <div className="rx-grid rx-grid-full">
            <label className={errors.diagnosis ? 'error' : ''}>
              Diagnosis / Disease *
              <SearchableSelectInput
                inputId="prescription-diagnosis"
                listId="prescription-diagnosis-list"
                value={form.diagnosis}
                onChange={value => {
                  set('diagnosis', value);
                  addDiagnosis(value);
                }}
                options={diagnosisOptions}
                placeholder="Primary diagnosis or disease name"
                allowCustom
              />
              {errors.diagnosis && (
                <span className="err-msg">{errors.diagnosis}</span>
              )}
            </label>
            <label className={errors.symptoms ? 'error' : ''}>
              Symptoms *
              <textarea
                rows={3}
                value={form.symptoms}
                onChange={e => set('symptoms', e.target.value)}
                placeholder="Describe the symptoms observed…"
              />
              {errors.symptoms && (
                <span className="err-msg">{errors.symptoms}</span>
              )}
            </label>
            <label>
              Duration of Illness
              <input
                value={form.duration}
                onChange={e => set('duration', e.target.value)}
                placeholder="e.g. 3 days, 1 week"
              />
            </label>
            <label>
              Prescription Date
              <input
                type="date"
                value={form.prescriptionDate}
                onChange={e => set('prescriptionDate', e.target.value)}
                max={today}
              />
            </label>
          </div>
        </section>

        {/* Section: Medicines */}
        <section className="rx-section dash-card">
          <div className="rx-section-header">
            <h2 className="rx-section-title">Medicine Prescription</h2>
            <button type="button" className="btn-add-row" onClick={addMedicine}>
              <Plus size={14} /> Add Medicine
            </button>
          </div>
          <div className="medicine-table-wrapper">
            <table className="medicine-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.medicines.map((med, idx) => (
                  <tr key={med.id}>
                    <td className="row-num">{idx + 1}</td>
                    <td>
                      <input
                        value={med.name}
                        onChange={e =>
                          updateMedicine(med.id, 'name', e.target.value)
                        }
                        placeholder="Medicine name"
                      />
                    </td>
                    <td>
                      <input
                        value={med.dosage}
                        onChange={e =>
                          updateMedicine(med.id, 'dosage', e.target.value)
                        }
                        placeholder="e.g. 500mg"
                      />
                    </td>
                    <td>
                      <input
                        value={med.frequency}
                        onChange={e =>
                          updateMedicine(med.id, 'frequency', e.target.value)
                        }
                        placeholder="e.g. Twice daily"
                      />
                    </td>
                    <td>
                      <input
                        value={med.duration}
                        onChange={e =>
                          updateMedicine(med.id, 'duration', e.target.value)
                        }
                        placeholder="e.g. 5 days"
                      />
                    </td>
                    <td>
                      <input
                        value={med.instructions}
                        onChange={e =>
                          updateMedicine(med.id, 'instructions', e.target.value)
                        }
                        placeholder="e.g. After meals"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove-row"
                        onClick={() => removeMedicine(med.id)}
                        disabled={form.medicines.length === 1}
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Investigations & Precautions */}
        <section className="rx-section dash-card">
          <h2 className="rx-section-title">Further Management</h2>
          <div className="rx-grid rx-grid-full">
            <label>
              Lab / Pathology Investigations Required
              <textarea
                rows={3}
                value={form.pathologyTests}
                onChange={e => set('pathologyTests', e.target.value)}
                placeholder="List any blood tests, X-ray, ultrasound, etc."
              />
            </label>
            <label>
              Precautions / Advice
              <textarea
                rows={3}
                value={form.precautions}
                onChange={e => set('precautions', e.target.value)}
                placeholder="Diet restrictions, activity limitations, care instructions…"
              />
            </label>
            <label style={{ maxWidth: 280 }}>
              Next Visit Date (optional)
              <input
                type="date"
                value={form.nextVisit}
                onChange={e => set('nextVisit', e.target.value)}
                min={today}
              />
            </label>
          </div>
        </section>

        <div className="rx-actions">
          <button type="button" className="btn-print" onClick={handlePrint}>
            <Printer size={16} /> Generate &amp; Print Prescription
          </button>
        </div>
      </div>

      {/* ── Printable Prescription ── */}
      <div className="rx-print-view print-only" ref={printRef}>
        <div className="rx-print-header">
          <div className="rx-clinic-info">
            <h1>Dr. {doctorName}</h1>
            <p className="rx-clinic-sub">Veterinary Physician</p>
          </div>
          <div className="rx-print-meta">
            <p>
              <strong>Rx No:</strong> {rxNo}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(form.prescriptionDate)}
            </p>
          </div>
        </div>
        <hr className="rx-divider" />

        <div className="rx-print-details">
          <table className="rx-detail-table">
            <tbody>
              <tr>
                <td>
                  <strong>Animal Name:</strong> {form.animalName}
                </td>
                <td>
                  <strong>Species:</strong> {form.species}
                </td>
                <td>
                  <strong>Breed:</strong> {form.breed || '—'}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Age:</strong> {form.age || '—'}
                </td>
                <td>
                  <strong>Weight:</strong>{' '}
                  {form.weight ? `${form.weight} kg` : '—'}
                </td>
                <td>
                  <strong>Height:</strong>{' '}
                  {form.height ? `${form.height} cm` : '—'}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Owner:</strong> {form.ownerName}
                </td>
                <td>
                  <strong>Contact:</strong> {form.ownerContact || '—'}
                </td>
                <td>
                  <strong>Duration:</strong> {form.duration || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr className="rx-divider" />

        <div className="rx-print-section">
          <strong>Diagnosis / Disease:</strong>
          <p>{form.diagnosis}</p>
        </div>

        <div className="rx-print-section">
          <strong>Symptoms:</strong>
          <p>{form.symptoms}</p>
        </div>

        <div className="rx-print-section">
          <strong>℞ Medications:</strong>
          <table className="rx-medicine-print-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {form.medicines
                .filter(m => m.name)
                .map((med, i) => (
                  <tr key={med.id}>
                    <td>{i + 1}</td>
                    <td>{med.name}</td>
                    <td>{med.dosage}</td>
                    <td>{med.frequency}</td>
                    <td>{med.duration}</td>
                    <td>{med.instructions}</td>
                  </tr>
                ))}
              {form.medicines.filter(m => m.name).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', color: '#94a3b8' }}
                  >
                    No medicines prescribed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {form.pathologyTests && (
          <div className="rx-print-section">
            <strong>Lab / Pathology Investigations:</strong>
            <p>{form.pathologyTests}</p>
          </div>
        )}

        {form.precautions && (
          <div className="rx-print-section">
            <strong>Precautions / Advice:</strong>
            <p>{form.precautions}</p>
          </div>
        )}

        {form.nextVisit && (
          <div className="rx-print-section">
            <strong>Next Visit:</strong> {formatDate(form.nextVisit)}
          </div>
        )}

        <div className="rx-print-footer">
          <div className="rx-signature-block">
            <div className="rx-signature-line" />
            <p>Dr. {doctorName}</p>
            <p>Veterinary Physician</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prescriptions;
