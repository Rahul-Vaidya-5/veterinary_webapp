import { useState } from 'react';
import { Syringe, Plus, Bell, X, FileText } from 'lucide-react';
import '../dashboard/OwnerDashboard.css';
import './PetHealth.css';

type MedicalRecord = {
  id: string;
  petName: string;
  date: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
};

type VaccinationRecord = {
  id: string;
  petName: string;
  vaccine: string;
  date: string;
  nextDue: string;
  doctor: string;
  batchNo: string;
};

const LS_MED = 'vc_owner_medical_records';
const LS_VAC = 'vc_owner_vaccination_records';

function loadMed(): MedicalRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LS_MED) ?? '[]');
  } catch {
    return [];
  }
}
function loadVac(): VaccinationRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LS_VAC) ?? '[]');
  } catch {
    return [];
  }
}
function saveMed(d: MedicalRecord[]) {
  localStorage.setItem(LS_MED, JSON.stringify(d));
}
function saveVac(d: VaccinationRecord[]) {
  localStorage.setItem(LS_VAC, JSON.stringify(d));
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function PetHealth() {
  const [tab, setTab] = useState<'medical' | 'vaccination'>('vaccination');
  const [medRecords, setMedRecords] = useState<MedicalRecord[]>(loadMed);
  const [vacRecords, setVacRecords] = useState<VaccinationRecord[]>(loadVac);
  const [showMedForm, setShowMedForm] = useState(false);
  const [showVacForm, setShowVacForm] = useState(false);
  const [medForm, setMedForm] = useState({
    petName: '',
    date: '',
    doctor: '',
    diagnosis: '',
    prescription: '',
    notes: '',
  });
  const [vacForm, setVacForm] = useState({
    petName: '',
    vaccine: '',
    date: '',
    nextDue: '',
    doctor: '',
    batchNo: '',
  });
  const [formError, setFormError] = useState('');

  // Upcoming vaccinations (due within 60 days)
  const upcomingVac = vacRecords
    .filter(v => v.nextDue)
    .map(v => ({ ...v, daysLeft: daysUntil(v.nextDue) }))
    .filter(v => v.daysLeft <= 60)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  function handleAddMed(e: React.FormEvent) {
    e.preventDefault();
    if (!medForm.petName.trim() || !medForm.date || !medForm.diagnosis.trim()) {
      setFormError('Pet name, date and diagnosis are required.');
      return;
    }
    const rec: MedicalRecord = { ...medForm, id: `med_${Date.now()}` };
    const updated = [rec, ...medRecords];
    setMedRecords(updated);
    saveMed(updated);
    setMedForm({
      petName: '',
      date: '',
      doctor: '',
      diagnosis: '',
      prescription: '',
      notes: '',
    });
    setFormError('');
    setShowMedForm(false);
  }

  function handleAddVac(e: React.FormEvent) {
    e.preventDefault();
    if (!vacForm.petName.trim() || !vacForm.vaccine.trim() || !vacForm.date) {
      setFormError('Pet name, vaccine and date are required.');
      return;
    }
    const rec: VaccinationRecord = { ...vacForm, id: `vac_${Date.now()}` };
    const updated = [rec, ...vacRecords];
    setVacRecords(updated);
    saveVac(updated);
    setVacForm({
      petName: '',
      vaccine: '',
      date: '',
      nextDue: '',
      doctor: '',
      batchNo: '',
    });
    setFormError('');
    setShowVacForm(false);
  }

  function deleteMed(id: string) {
    const u = medRecords.filter(r => r.id !== id);
    setMedRecords(u);
    saveMed(u);
  }
  function deleteVac(id: string) {
    const u = vacRecords.filter(r => r.id !== id);
    setVacRecords(u);
    saveVac(u);
  }

  return (
    <div className="pet-health">
      <div className="ov-header">
        <div>
          <h1 className="ow-page-title">Pet Health Records 🏥</h1>
          <p className="ow-page-sub">
            Track medical history and vaccination schedule for all your pets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="ow-btn ow-btn-secondary"
            onClick={() => {
              setShowMedForm(true);
              setFormError('');
            }}
            type="button"
          >
            <Plus size={15} /> Medical Record
          </button>
          <button
            className="ow-btn ow-btn-primary"
            onClick={() => {
              setShowVacForm(true);
              setFormError('');
            }}
            type="button"
          >
            <Syringe size={15} /> Vaccination
          </button>
        </div>
      </div>

      {/* Vaccination Alerts */}
      {upcomingVac.length > 0 && (
        <div className="ph-alerts">
          <div className="ph-alert-title">
            <Bell size={15} /> Vaccination Due Soon
          </div>
          {upcomingVac.map(v => (
            <div
              key={v.id}
              className={`ph-alert-item${v.daysLeft <= 7 ? ' urgent' : ''}`}
            >
              <Syringe size={13} />
              <strong>{v.petName}</strong> — {v.vaccine}
              <span className="ph-alert-due">
                {v.daysLeft <= 0
                  ? ' · Overdue!'
                  : v.daysLeft === 1
                    ? ' · Due tomorrow'
                    : ` · Due in ${v.daysLeft} days`}
              </span>
              <span className="ph-alert-date">({v.nextDue})</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="ph-tabs">
        <button
          className={`ph-tab${tab === 'vaccination' ? ' active' : ''}`}
          onClick={() => setTab('vaccination')}
          type="button"
        >
          <Syringe size={15} /> Vaccination History
        </button>
        <button
          className={`ph-tab${tab === 'medical' ? ' active' : ''}`}
          onClick={() => setTab('medical')}
          type="button"
        >
          <FileText size={15} /> Medical History
        </button>
      </div>

      {/* Vaccination Records */}
      {tab === 'vaccination' && (
        <div className="ow-card">
          {vacRecords.length === 0 ? (
            <div className="ow-empty">
              <div className="ow-empty-icon">💉</div>No vaccination records yet.
            </div>
          ) : (
            <div className="ph-record-list">
              {vacRecords.map(v => {
                const days = v.nextDue ? daysUntil(v.nextDue) : null;
                return (
                  <div key={v.id} className="ph-record-item">
                    <div className="ph-record-icon vac">💉</div>
                    <div className="ph-record-body">
                      <div className="ph-record-title">
                        <strong>{v.petName}</strong> — {v.vaccine}
                      </div>
                      <div className="ph-record-meta">
                        Given: {v.date}
                        {v.doctor && ` · Dr. ${v.doctor}`}
                        {v.batchNo && ` · Batch: ${v.batchNo}`}
                      </div>
                      {v.nextDue && (
                        <div
                          className={`ph-record-next${days !== null && days <= 30 ? ' urgent' : ''}`}
                        >
                          Next due: {v.nextDue}
                          {days !== null &&
                            ` (${days <= 0 ? 'Overdue' : `${days} days`})`}
                        </div>
                      )}
                    </div>
                    <button
                      className="ph-delete-btn"
                      onClick={() => deleteVac(v.id)}
                      title="Delete"
                      type="button"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Medical Records */}
      {tab === 'medical' && (
        <div className="ow-card">
          {medRecords.length === 0 ? (
            <div className="ow-empty">
              <div className="ow-empty-icon">📋</div>No medical records yet.
            </div>
          ) : (
            <div className="ph-record-list">
              {medRecords.map(r => (
                <div key={r.id} className="ph-record-item">
                  <div className="ph-record-icon med">📋</div>
                  <div className="ph-record-body">
                    <div className="ph-record-title">
                      <strong>{r.petName}</strong> — {r.diagnosis}
                    </div>
                    <div className="ph-record-meta">
                      {r.date}
                      {r.doctor && ` · Dr. ${r.doctor}`}
                    </div>
                    {r.prescription && (
                      <div className="ph-record-rx">💊 {r.prescription}</div>
                    )}
                    {r.notes && (
                      <div className="ph-record-notes">{r.notes}</div>
                    )}
                  </div>
                  <button
                    className="ph-delete-btn"
                    onClick={() => deleteMed(r.id)}
                    title="Delete"
                    type="button"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Medical Record Form Modal */}
      {showMedForm && (
        <div className="ov-modal-overlay" onClick={() => setShowMedForm(false)}>
          <div className="ov-modal" onClick={e => e.stopPropagation()}>
            <div className="ov-modal-header">
              <h3>Add Medical Record</h3>
              <button
                className="ov-modal-close"
                onClick={() => setShowMedForm(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMed}>
              <div className="ow-form-grid">
                <label className="ow-label">
                  Pet Name *
                  <input
                    className="ow-input"
                    value={medForm.petName}
                    onChange={e =>
                      setMedForm(p => ({ ...p, petName: e.target.value }))
                    }
                    placeholder="e.g. Buddy"
                  />
                </label>
                <label className="ow-label">
                  Date *
                  <input
                    className="ow-input"
                    type="date"
                    value={medForm.date}
                    onChange={e =>
                      setMedForm(p => ({ ...p, date: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label full">
                  Diagnosis *
                  <input
                    className="ow-input"
                    value={medForm.diagnosis}
                    onChange={e =>
                      setMedForm(p => ({ ...p, diagnosis: e.target.value }))
                    }
                    placeholder="e.g. Skin infection"
                  />
                </label>
                <label className="ow-label">
                  Doctor
                  <input
                    className="ow-input"
                    value={medForm.doctor}
                    onChange={e =>
                      setMedForm(p => ({ ...p, doctor: e.target.value }))
                    }
                    placeholder="Doctor name"
                  />
                </label>
                <label className="ow-label">
                  Prescription
                  <input
                    className="ow-input"
                    value={medForm.prescription}
                    onChange={e =>
                      setMedForm(p => ({ ...p, prescription: e.target.value }))
                    }
                    placeholder="Medicines prescribed"
                  />
                </label>
                <label className="ow-label full">
                  Notes
                  <textarea
                    className="ow-textarea"
                    value={medForm.notes}
                    onChange={e =>
                      setMedForm(p => ({ ...p, notes: e.target.value }))
                    }
                    placeholder="Additional notes..."
                  />
                </label>
              </div>
              {formError && <p className="ov-form-error">{formError}</p>}
              <div className="ov-modal-actions">
                <button
                  className="ow-btn ow-btn-secondary"
                  type="button"
                  onClick={() => setShowMedForm(false)}
                >
                  Cancel
                </button>
                <button className="ow-btn ow-btn-primary" type="submit">
                  <Plus size={15} /> Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vaccination Form Modal */}
      {showVacForm && (
        <div className="ov-modal-overlay" onClick={() => setShowVacForm(false)}>
          <div className="ov-modal" onClick={e => e.stopPropagation()}>
            <div className="ov-modal-header">
              <h3>Add Vaccination Record</h3>
              <button
                className="ov-modal-close"
                onClick={() => setShowVacForm(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVac}>
              <div className="ow-form-grid">
                <label className="ow-label">
                  Pet Name *
                  <input
                    className="ow-input"
                    value={vacForm.petName}
                    onChange={e =>
                      setVacForm(p => ({ ...p, petName: e.target.value }))
                    }
                    placeholder="e.g. Buddy"
                  />
                </label>
                <label className="ow-label">
                  Vaccine *
                  <input
                    className="ow-input"
                    value={vacForm.vaccine}
                    onChange={e =>
                      setVacForm(p => ({ ...p, vaccine: e.target.value }))
                    }
                    placeholder="e.g. Rabies, DHPP"
                  />
                </label>
                <label className="ow-label">
                  Date Given *
                  <input
                    className="ow-input"
                    type="date"
                    value={vacForm.date}
                    onChange={e =>
                      setVacForm(p => ({ ...p, date: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  Next Due Date
                  <input
                    className="ow-input"
                    type="date"
                    value={vacForm.nextDue}
                    onChange={e =>
                      setVacForm(p => ({ ...p, nextDue: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  Doctor / Vet
                  <input
                    className="ow-input"
                    value={vacForm.doctor}
                    onChange={e =>
                      setVacForm(p => ({ ...p, doctor: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  Batch No.
                  <input
                    className="ow-input"
                    value={vacForm.batchNo}
                    onChange={e =>
                      setVacForm(p => ({ ...p, batchNo: e.target.value }))
                    }
                  />
                </label>
              </div>
              {formError && <p className="ov-form-error">{formError}</p>}
              <div className="ov-modal-actions">
                <button
                  className="ow-btn ow-btn-secondary"
                  type="button"
                  onClick={() => setShowVacForm(false)}
                >
                  Cancel
                </button>
                <button className="ow-btn ow-btn-primary" type="submit">
                  <Syringe size={15} /> Save Vaccination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetHealth;
