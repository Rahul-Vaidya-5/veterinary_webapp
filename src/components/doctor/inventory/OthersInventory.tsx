import { useState, useEffect } from 'react';
import {
  Box,
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

type InventoryCategory =
  | 'Surgical'
  | 'Diagnostic'
  | 'Supplies'
  | 'Consumables'
  | 'Other';

type OtherItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  costPerUnit: number;
  lowStockThreshold: number;
  notes: string;
};

const LS_KEY = 'vc_inventory_others';
const today = getIstDateKey();

const load = (): OtherItem[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const emptyItem = (): Omit<OtherItem, 'id'> => ({
  name: '',
  category: 'Surgical',
  quantity: 0,
  unit: 'pcs',
  expiryDate: '',
  supplier: '',
  costPerUnit: 0,
  lowStockThreshold: 5,
  notes: '',
});

const CATEGORIES: InventoryCategory[] = [
  'Surgical',
  'Diagnostic',
  'Supplies',
  'Consumables',
  'Other',
];
const UNITS = ['pcs', 'pairs', 'boxes', 'kg', 'L', 'ml', 'rolls', 'sets'];

const CATEGORY_COLORS: Record<InventoryCategory, string> = {
  Surgical: '#ef4444',
  Diagnostic: '#3b82f6',
  Supplies: '#10b981',
  Consumables: '#f59e0b',
  Other: '#64748b',
};

function OthersInventory() {
  const [items, setItems] = useState<OtherItem[]>(load);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyItem());
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterCat, setFilterCat] = useState<InventoryCategory | 'All'>('All');

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
      setItems(prev => [...prev, { ...form, id: `inv-${Date.now()}` }]);
    }
    setForm(emptyItem());
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (item: OtherItem) => {
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

  const isLowStock = (item: OtherItem) =>
    item.quantity <= item.lowStockThreshold;
  const isExpiringSoon = (item: OtherItem) => {
    if (!item.expiryDate) return false;
    const diff =
      (new Date(item.expiryDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  };
  const isExpired = (item: OtherItem) =>
    !!item.expiryDate && item.expiryDate < today;

  const displayed =
    filterCat === 'All' ? items : items.filter(i => i.category === filterCat);
  const lowCount = items.filter(isLowStock).length;

  return (
    <div className="inventory-page">
      <div className="inv-header">
        <h1 className="dash-page-title">
          <Box size={22} /> Others Inventory
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
            {lowCount} item{lowCount > 1 ? 's are' : ' is'} low in stock or
            expired.
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
                placeholder="Item name"
              />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
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

      {/* Category filter tabs */}
      {items.length > 0 && (
        <div className="inv-filter-tabs">
          {(['All', ...CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              type="button"
              className={`inv-filter-tab${filterCat === cat ? ' active' : ''}`}
              style={
                cat !== 'All'
                  ? ({
                      '--tab-c': CATEGORY_COLORS[cat as InventoryCategory],
                    } as React.CSSProperties)
                  : undefined
              }
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="dash-card">
        {displayed.length === 0 && items.length === 0 ? (
          <p className="inv-empty">
            No inventory items. Click "+ Add Item" to start.
          </p>
        ) : displayed.length === 0 ? (
          <p className="inv-empty">No items in this category.</p>
        ) : (
          <div className="inv-table-wrapper">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Expiry</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(item => (
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
                    <td>
                      <span
                        className="category-chip"
                        style={
                          {
                            '--chip-color': CATEGORY_COLORS[item.category],
                          } as React.CSSProperties
                        }
                      >
                        {item.category}
                      </span>
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
                    <td>
                      {isExpired(item) ? (
                        <span className="inv-badge expired">Expired</span>
                      ) : isExpiringSoon(item) ? (
                        <span className="inv-badge expiring">Expiring</span>
                      ) : isLowStock(item) ? (
                        <span className="inv-badge low-stock">Low Stock</span>
                      ) : (
                        <span className="inv-badge in-stock">OK</span>
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
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
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

export default OthersInventory;
