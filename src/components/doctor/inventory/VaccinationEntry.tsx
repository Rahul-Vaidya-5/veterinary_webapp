import { useState, useEffect } from 'react';
import {
  Syringe,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import './Inventory.css';
import { getIstDateKey } from '../../../utils/istDateTime';

type VaccineEntry = {
  id: string;
  name: string;
  brand: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  animalType: string;
  manufacturer: string;
  costPerDose: number;
  notes: string;
};

const LS_KEY = 'vc_vaccinations';
const today = getIstDateKey();

const load = (): VaccineEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const emptyEntry = (): Omit<VaccineEntry, 'id'> => ({
  name: '',
  brand: '',
  batchNumber: '',
  quantity: 0,
  expiryDate: '',
  animalType: '',
  manufacturer: '',
  costPerDose: 0,
  notes: '',
});

const ANIMAL_TYPES = [
  'Dog',
  'Cat',
  'Rabbit',
  'Cow',
  'Goat',
  'Poultry',
  'Horse',
  'Multiple',
  'Other',
];

function VaccinationEntry() {
  const [entries, setEntries] = useState<VaccineEntry[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyEntry());
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  }, [entries]);

  const set = (f: string, v: string | number) => {
    setForm(prev => ({ ...prev, [f]: v }));
    setErrors(e => {
      const n = { ...e };
      delete n[f];
      return n;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (form.quantity < 0) e.quantity = 'Cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      setEntries(prev =>
        prev.map(i => (i.id === editId ? { ...form, id: editId } : i)),
      );
      setEditId(null);
    } else {
      setEntries(prev => [...prev, { ...form, id: `vacc-${Date.now()}` }]);
    }
    setForm(emptyEntry());
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (entry: VaccineEntry) => {
    const { id, ...rest } = entry;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(emptyEntry());
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const remove = (id: string) =>
    setEntries(prev => prev.filter(i => i.id !== id));

  const isExpired = (e: VaccineEntry) => e.expiryDate && e.expiryDate < today;
  const isExpiringSoon = (e: VaccineEntry) => {
    if (!e.expiryDate) return false;
    const diff =
      (new Date(e.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  };

  return (
    <div className="inventory-page">
      <div className="inv-header">
        <h1 className="dash-page-title">
          <Syringe size={22} /> Vaccination Entry
        </h1>
        <button
          type="button"
          className="btn-inv-add"
          onClick={() => {
            setShowForm(v => !v);
            if (editId) {
              setEditId(null);
              setForm(emptyEntry());
            }
          }}
        >
          <Plus size={15} /> Add Vaccine
        </button>
      </div>

      {entries.filter(isExpired).length > 0 && (
        <div className="inv-alert">
          <AlertTriangle size={15} />
          <span>
            {entries.filter(isExpired).length} vaccine(s) have expired!
          </span>
        </div>
      )}

      {showForm && (
        <section className="dash-card inv-form-card">
          <h3 className="inv-form-title">
            {editId ? 'Edit Vaccine' : 'Add Vaccine'}
          </h3>
          <div className="inv-grid">
            <label className={errors.name ? 'error' : ''}>
              Vaccine Name *
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Rabies Vaccine"
              />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </label>
            <label>
              Brand
              <input
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
                placeholder="Manufacturer brand"
              />
            </label>
            <label>
              Batch Number
              <input
                value={form.batchNumber}
                onChange={e => set('batchNumber', e.target.value)}
                placeholder="Batch / Lot no."
              />
            </label>
            <label className={errors.quantity ? 'error' : ''}>
              Quantity (doses)
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={e => set('quantity', Number(e.target.value))}
              />
              {errors.quantity && (
                <span className="err-msg">{errors.quantity}</span>
              )}
            </label>
            <label>
              Expiry Date
              <input
                type="date"
                value={form.expiryDate}
                onChange={e => set('expiryDate', e.target.value)}
              />
            </label>
            <label>
              Animal Type
              <select
                value={form.animalType}
                onChange={e => set('animalType', e.target.value)}
              >
                <option value="">Select…</option>
                {ANIMAL_TYPES.map(a => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label>
              Cost / Dose (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costPerDose || ''}
                onChange={e => set('costPerDose', Number(e.target.value))}
                placeholder="0.00"
              />
            </label>
            <label className="inv-full">
              Notes
              <input
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Storage conditions, disease covered, etc."
              />
            </label>
          </div>
          <div className="inv-form-actions">
            <button
              type="button"
              className="btn-inv-outline"
              onClick={handleCancel}
            >
              <X size={14} /> Cancel
            </button>
            <button
              type="button"
              className="btn-inv-primary"
              onClick={handleSave}
            >
              <Check size={14} /> {editId ? 'Update' : 'Save'}
            </button>
          </div>
        </section>
      )}

      <div className="dash-card">
        {entries.length === 0 ? (
          <p className="inv-empty">
            No vaccination entries. Click "+ Add Vaccine" to start.
          </p>
        ) : (
          <div className="inv-table-wrapper">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Vaccine Name</th>
                  <th>Brand</th>
                  <th>Batch</th>
                  <th>Qty</th>
                  <th>Animal Type</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr
                    key={entry.id}
                    className={isExpired(entry) ? 'row-expired' : ''}
                  >
                    <td>
                      <strong>{entry.name}</strong>
                    </td>
                    <td>{entry.brand || '—'}</td>
                    <td>{entry.batchNumber || '—'}</td>
                    <td>{entry.quantity}</td>
                    <td>{entry.animalType || '—'}</td>
                    <td
                      className={
                        isExpired(entry)
                          ? 'expired-date'
                          : isExpiringSoon(entry)
                            ? 'expiring-date'
                            : ''
                      }
                    >
                      {entry.expiryDate || '—'}
                    </td>
                    <td>
                      {isExpired(entry) ? (
                        <span className="inv-badge expired">Expired</span>
                      ) : isExpiringSoon(entry) ? (
                        <span className="inv-badge expiring">
                          Expiring Soon
                        </span>
                      ) : entry.quantity === 0 ? (
                        <span className="inv-badge low-stock">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inv-badge in-stock">Available</span>
                      )}
                    </td>
                    <td>
                      <div className="inv-row-actions">
                        <button
                          type="button"
                          className="inv-action-btn edit-btn"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="inv-action-btn delete-btn"
                          onClick={() => remove(entry.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default VaccinationEntry;
