import { useState, useEffect } from 'react';
import { IndianRupee, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import './Employee.css';
import { getIstDateKey } from '../../../utils/istDateTime';
import { ConfirmModal } from '../../utility/ConfirmModal';

type SalaryType = 'Monthly' | 'Daily' | 'Hourly';

type EmployeeWage = {
  id: string;
  name: string;
  role: string;
  salaryType: SalaryType;
  rate: number;
  joiningDate: string;
  phone: string;
  notes: string;
};

const LS_KEY = 'vc_employee_wages';
const today = getIstDateKey();

const load = (): EmployeeWage[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const emptyForm = (): Omit<EmployeeWage, 'id'> => ({
  name: '',
  role: '',
  salaryType: 'Monthly',
  rate: 0,
  joiningDate: today,
  phone: '',
  notes: '',
});

function EmployeeWages() {
  const [wages, setWages] = useState<EmployeeWage[]>(load);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(wages));
  }, [wages]);

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
    if (!form.rate || form.rate <= 0) e.rate = 'Enter valid rate';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      setWages(prev =>
        prev.map(w => (w.id === editId ? { ...form, id: editId } : w)),
      );
      setEditId(null);
    } else {
      setWages(prev => [...prev, { ...form, id: `emp-${Date.now()}` }]);
    }
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleEdit = (emp: EmployeeWage) => {
    const { id, ...rest } = emp;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const remove = (id: string) => setDeleteTarget(id);

  const totalMonthly = wages
    .filter(w => w.salaryType === 'Monthly')
    .reduce((s, w) => s + w.rate, 0);

  const rateLabel = (type: SalaryType) =>
    type === 'Monthly' ? '/month' : type === 'Daily' ? '/day' : '/hour';

  return (
    <div className="employee-page">
      <div className="emp-wages-header">
        <h1 className="dash-page-title">
          <IndianRupee size={22} /> Employee Wages
        </h1>
        <button
          type="button"
          className="btn-add-emp-wage"
          onClick={() => {
            setShowForm(v => !v);
            if (editId) {
              setEditId(null);
              setForm(emptyForm());
            }
          }}
        >
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <section className="dash-card emp-wage-form">
          <h3 className="emp-form-title">
            {editId ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <div className="emp-wage-grid">
            <label className={errors.name ? 'error' : ''}>
              Name *
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Full name"
              />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </label>
            <label>
              Role
              <input
                value={form.role}
                onChange={e => set('role', e.target.value)}
                placeholder="e.g. Nurse, Receptionist"
              />
            </label>
            <label>
              Salary Type
              <select
                value={form.salaryType}
                onChange={e => set('salaryType', e.target.value)}
              >
                <option>Monthly</option>
                <option>Daily</option>
                <option>Hourly</option>
              </select>
            </label>
            <label className={errors.rate ? 'error' : ''}>
              Rate (₹) {rateLabel(form.salaryType)}
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.rate || ''}
                onChange={e => set('rate', Number(e.target.value))}
                placeholder="0.00"
              />
              {errors.rate && <span className="err-msg">{errors.rate}</span>}
            </label>
            <label>
              Joining Date
              <input
                type="date"
                value={form.joiningDate}
                max={today}
                onChange={e => set('joiningDate', e.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="Contact number"
              />
            </label>
            <label className="emp-full">
              Notes
              <input
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any additional notes"
              />
            </label>
          </div>
          <div className="emp-form-actions">
            <button
              type="button"
              className="btn-emp-outline"
              onClick={handleCancel}
            >
              <X size={14} /> Cancel
            </button>
            <button
              type="button"
              className="btn-emp-primary"
              onClick={handleSave}
            >
              <Check size={14} /> {editId ? 'Update' : 'Save'}
            </button>
          </div>
        </section>
      )}

      {/* Summary */}
      {wages.length > 0 && (
        <div className="wages-summary dash-card">
          <span className="wages-summary-text">
            <strong>{wages.length}</strong> employee
            {wages.length !== 1 ? 's' : ''} &nbsp;·&nbsp; Monthly payout:{' '}
            <strong>₹{totalMonthly.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      )}

      {/* List */}
      <div className="dash-card">
        {wages.length === 0 ? (
          <p className="emp-empty">
            No employees added yet. Click "+ Add Employee" to get started.
          </p>
        ) : (
          <div className="wages-list">
            {wages.map(emp => (
              <div key={emp.id} className="wage-row">
                <div className="emp-avatar wage-avatar">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div className="wage-info">
                  <span className="emp-name">{emp.name}</span>
                  {emp.role && <span className="emp-role">{emp.role}</span>}
                  {emp.phone && <span className="emp-phone">{emp.phone}</span>}
                </div>
                <div className="wage-rate-info">
                  <span className="wage-amount">
                    ₹{emp.rate.toLocaleString('en-IN')}
                  </span>
                  <span className="wage-type-label">
                    {rateLabel(emp.salaryType)}
                  </span>
                </div>
                <div className="wage-meta">
                  <span className="wage-joining">Since {emp.joiningDate}</span>
                  <span
                    className={`salary-type-badge type-${emp.salaryType.toLowerCase()}`}
                  >
                    {emp.salaryType}
                  </span>
                </div>
                <div className="wage-actions">
                  <button
                    type="button"
                    className="wage-action-btn edit-btn"
                    onClick={() => handleEdit(emp)}
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="wage-action-btn delete-btn"
                    onClick={() => remove(emp.id)}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Wage Record"
        message="Are you sure you want to delete this employee wage record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          setWages(prev => prev.filter(w => w.id !== deleteTarget));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default EmployeeWages;
