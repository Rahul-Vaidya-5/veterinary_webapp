import { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Save } from 'lucide-react';
import './Expenses.css';
import { getIstDateKey } from '../../../utils/istDateTime';

type ExpenseCategory =
  | 'Medicines'
  | 'Equipment'
  | 'Rent'
  | 'Salary'
  | 'Transportation'
  | 'Utilities'
  | 'Maintenance'
  | 'Other';

type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
};

const LS_KEY = 'vc_expenses';
const today = getIstDateKey();

const load = (): Expense[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const CATEGORIES: ExpenseCategory[] = [
  'Medicines',
  'Equipment',
  'Rent',
  'Salary',
  'Transportation',
  'Utilities',
  'Maintenance',
  'Other',
];
const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Card',
  'Bank Transfer',
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Medicines: '#ef4444',
  Equipment: '#f59e0b',
  Rent: '#8b5cf6',
  Salary: '#ec4899',
  Transportation: '#0ea5e9',
  Utilities: '#06b6d4',
  Maintenance: '#f97316',
  Other: '#64748b',
};

function FillExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(load);
  const [form, setForm] = useState({
    date: today,
    category: 'Medicines' as ExpenseCategory,
    amount: '',
    description: '',
    paymentMethod: 'Cash' as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const set = (f: string, v: string) => {
    setForm(prev => ({ ...prev, [f]: v }));
    setErrors(e => {
      const n = { ...e };
      delete n[f];
      return n;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid amount';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const entry: Expense = {
      id: `exp-${Date.now()}`,
      date: form.date,
      category: form.category,
      amount: Number(Number(form.amount).toFixed(2)),
      description: form.description,
      paymentMethod: form.paymentMethod,
    };
    setExpenses(prev => [entry, ...prev]);
    setForm({
      date: today,
      category: 'Medicines',
      amount: '',
      description: '',
      paymentMethod: 'Cash',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const remove = (id: string) =>
    setExpenses(prev => prev.filter(e => e.id !== id));

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="expenses-page">
      <h1 className="dash-page-title">
        <Receipt size={22} /> Fill Expenses
      </h1>

      {/* Form */}
      <section className="dash-card eb-form-card">
        <form className="eb-form" onSubmit={handleAdd}>
          <div className="eb-grid">
            <label>
              Date
              <input
                type="date"
                value={form.date}
                max={today}
                onChange={e => set('date', e.target.value)}
              />
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
            <label className={errors.amount ? 'error' : ''}>
              Amount (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="0.00"
              />
              {errors.amount && (
                <span className="err-msg">{errors.amount}</span>
              )}
            </label>
            <label>
              Payment Method
              <select
                value={form.paymentMethod}
                onChange={e => set('paymentMethod', e.target.value)}
              >
                {PAYMENT_METHODS.map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className={`eb-full ${errors.description ? 'error' : ''}`}>
              Description
              <input
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Brief description of expense"
              />
              {errors.description && (
                <span className="err-msg">{errors.description}</span>
              )}
            </label>
          </div>
          <div className="eb-form-footer">
            {saved && (
              <span className="save-indicator">
                <Save size={13} /> Saved
              </span>
            )}
            <button type="submit" className="btn-eb-add">
              <Plus size={15} /> Add Expense
            </button>
          </div>
        </form>
      </section>

      {/* Table */}
      <section className="dash-card eb-table-card">
        <div className="eb-table-header">
          <h3>Expense Records</h3>
          <span className="eb-total">
            Total:{' '}
            <strong>
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </div>
        {expenses.length === 0 ? (
          <p className="eb-empty">No expenses recorded yet.</p>
        ) : (
          <div className="eb-table-wrapper">
            <table className="eb-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th className="text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>
                      <span
                        className="category-chip"
                        style={
                          {
                            '--chip-color': CATEGORY_COLORS[exp.category],
                          } as React.CSSProperties
                        }
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td>{exp.description}</td>
                    <td>{exp.paymentMethod}</td>
                    <td className="text-right amount-cell">
                      ₹
                      {exp.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-row-delete"
                        onClick={() => remove(exp.id)}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default FillExpenses;
