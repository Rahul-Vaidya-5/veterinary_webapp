import { useState, useRef } from 'react';
import { ClipboardList, Plus, Trash2, Printer } from 'lucide-react';
import { useDoctorInfo } from '../dashboard/DoctorDashboard';
import './Prescriptions.css';

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

const today = new Date().toISOString().split('T')[0];

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
  const { doctorName } = useDoctorInfo();
  const printRef = useRef<HTMLDivElement>(null);

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

  const [rxNo] = useState(`RX-${new Date().getFullYear()}-${++rxCounter}`);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    window.print();
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', {
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
          <div className="rx-grid">
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
              <input
                value={form.species}
                onChange={e => set('species', e.target.value)}
                placeholder="e.g. Dog, Cat, Rabbit"
              />
              {errors.species && (
                <span className="err-msg">{errors.species}</span>
              )}
            </label>
            <label>
              Breed
              <input
                value={form.breed}
                onChange={e => set('breed', e.target.value)}
                placeholder="e.g. Labrador"
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

        {/* Section: Medical Info */}
        <section className="rx-section dash-card">
          <h2 className="rx-section-title">Medical Information</h2>
          <div className="rx-grid rx-grid-full">
            <label className={errors.diagnosis ? 'error' : ''}>
              Diagnosis / Disease *
              <input
                value={form.diagnosis}
                onChange={e => set('diagnosis', e.target.value)}
                placeholder="Primary diagnosis or disease name"
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
