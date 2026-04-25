import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import './Inventory.css';
import { getIstDateKey } from '../../../utils/istDateTime';
import { ConfirmModal } from '../../utility/ConfirmModal';

type MedicalKitItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  costPerUnit: number;
  lowStockThreshold: number;
  notes: string;
};

const LS_KEY = 'vc_medical_kit';
const today = getIstDateKey();

const load = (): MedicalKitItem[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const emptyItem = (): Omit<MedicalKitItem, 'id'> => ({
  name: '',
  quantity: 0,
  unit: 'pcs',
  expiryDate: '',
  supplier: '',
  costPerUnit: 0,
  lowStockThreshold: 5,
  notes: '',
});

const UNITS = [
  'pcs',
  'ml',
  'mg',
  'g',
  'kg',
  'L',
  'strips',
  'vials',
  'sachets',
  'tablets',
  'bottles',
];

function MedicalKitEntry() {
  const [items, setItems] = useState<MedicalKitItem[]>(load);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyItem());
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

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
      setItems(prev =>
        prev.map(i => (i.id === editId ? { ...form, id: editId } : i)),
      );
      setEditId(null);
    } else {
      setItems(prev => [...prev, { ...form, id: `kit-${Date.now()}` }]);
    }
    setForm(emptyItem());
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (item: MedicalKitItem) => {
    const { id, ...rest } = item;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(emptyItem());
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const remove = (id: string) => setDeleteTarget(id);

  const isLowStock = (item: MedicalKitItem) =>
    item.quantity <= item.lowStockThreshold;
  const isExpiringSoon = (item: MedicalKitItem) => {
    if (!item.expiryDate) return false;
    const diff =
      (new Date(item.expiryDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  };
  const isExpired = (item: MedicalKitItem) =>
    item.expiryDate && item.expiryDate < today;

  const lowCount = items.filter(isLowStock).length;

  return (
    <div className="inventory-page">
      <div className="inv-header">
        <h1 className="dash-page-title">
          <Package size={22} /> Medical Kit Entry
        </h1>
        <button
          type="button"
          className="btn-inv-add"
          onClick={() => {
            setShowForm(v => !v);
            if (editId) {
              setEditId(null);
              setForm(emptyItem());
            }
          }}
        >
          <Plus size={15} /> Add Item
        </button>
      </div>

      {lowCount > 0 && (
        <div className="inv-alert">
          <AlertTriangle size={15} />
          <span>
            {lowCount} item{lowCount > 1 ? 's are' : ' is'} low in stock!
          </span>
        </div>
      )}

      {showForm && (
        <section className="dash-card inv-form-card">
          <h3 className="inv-form-title">
            {editId ? 'Edit Item' : 'Add New Item'}
          </h3>
          <div className="inv-grid">
            <label className={errors.name ? 'error' : ''}>
              Item Name *
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Amoxicillin 500mg"
              />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </label>
            <label className={errors.quantity ? 'error' : ''}>
              Quantity
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
              Unit
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
              >
                {UNITS.map(u => (
                  <option key={u}>{u}</option>
                ))}
              </select>
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
              Supplier
              <input
                value={form.supplier}
                onChange={e => set('supplier', e.target.value)}
                placeholder="Supplier name"
              />
            </label>
            <label>
              Cost per Unit (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costPerUnit || ''}
                onChange={e => set('costPerUnit', Number(e.target.value))}
                placeholder="0.00"
              />
            </label>
            <label>
              Low Stock Alert ≤
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={e => set('lowStockThreshold', Number(e.target.value))}
              />
            </label>
            <label className="inv-full">
              Notes
              <input
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any notes"
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
        {items.length === 0 ? (
          <p className="inv-empty">
            No items in medical kit. Click "+ Add Item" to start.
          </p>
        ) : (
          <div className="inv-table-wrapper">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Expiry</th>
                  <th>Supplier</th>
                  <th>Cost/Unit</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id}
                    className={
                      isExpired(item)
                        ? 'row-expired'
                        : isLowStock(item)
                          ? 'row-low'
                          : ''
                    }
                  >
                    <td>
                      <strong>{item.name}</strong>
                      {item.notes && (
                        <span className="inv-notes"> · {item.notes}</span>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td
                      className={
                        isExpired(item)
                          ? 'expired-date'
                          : isExpiringSoon(item)
                            ? 'expiring-date'
                            : ''
                      }
                    >
                      {item.expiryDate || '—'}
                    </td>
                    <td>{item.supplier || '—'}</td>
                    <td>{item.costPerUnit ? `₹${item.costPerUnit}` : '—'}</td>
                    <td>
                      {isExpired(item) ? (
                        <span className="inv-badge expired">Expired</span>
                      ) : isExpiringSoon(item) ? (
                        <span className="inv-badge expiring">
                          Expiring Soon
                        </span>
                      ) : isLowStock(item) ? (
                        <span className="inv-badge low-stock">Low Stock</span>
                      ) : (
                        <span className="inv-badge in-stock">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="inv-row-actions">
                        <button
                          type="button"
                          className="inv-action-btn edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="inv-action-btn delete-btn"
                          onClick={() => remove(item.id)}
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

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Item"
        message="Are you sure you want to delete this medical kit item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          setItems(prev => prev.filter(i => i.id !== deleteTarget));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default MedicalKitEntry;
