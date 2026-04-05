import { useState, useEffect } from 'react';
import { TrendingUp, Plus, Trash2, Save } from 'lucide-react';
import './Expenses.css';

type IncomeSource =
  | 'Consultation'
  | 'Procedure'
  | 'Surgery'
  | 'Vaccination'
  | 'Grooming'
  | 'Other';
type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

type IncomeEntry = {
  id: string;
  date: string;
  source: IncomeSource;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
};

const LS_KEY = 'vc_income';
const today = new Date().toISOString().split('T')[0];

const load = (): IncomeEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const SOURCES: IncomeSource[] = [
  'Consultation',
  'Procedure',
  'Surgery',
  'Vaccination',
  'Grooming',
  'Other',
];
const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Card',
  'Bank Transfer',
];

const SOURCE_COLORS: Record<IncomeSource, string> = {
  Consultation: '#10b981',
  Procedure: '#3b82f6',
  Surgery: '#8b5cf6',
  Vaccination: '#f59e0b',
  Grooming: '#ec4899',
  Other: '#64748b',
};

function FillIncome() {
  const [entries, setEntries] = useState<IncomeEntry[]>(load);
  const [form, setForm] = useState({
    date: today,
    source: 'Consultation' as IncomeSource,
    amount: '',
    description: '',
    paymentMethod: 'Cash' as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  }, [entries]);

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
    const entry: IncomeEntry = {
      id: `inc-${Date.now()}`,
      date: form.date,
      source: form.source,
      amount: Number(Number(form.amount).toFixed(2)),
      description: form.description,
      paymentMethod: form.paymentMethod,
    };
    setEntries(prev => [entry, ...prev]);
    setForm({
      date: today,
      source: 'Consultation',
      amount: '',
      description: '',
      paymentMethod: 'Cash',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const remove = (id: string) =>
    setEntries(prev => prev.filter(e => e.id !== id));

  const total = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="expenses-page">
      <h1 className="dash-page-title">
        <TrendingUp size={22} /> Fill Income
      </h1>

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
              Source
              <select
                value={form.source}
                onChange={e => set('source', e.target.value)}
              >
                {SOURCES.map(s => (
                  <option key={s}>{s}</option>
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
                placeholder="e.g. Consultation for Bruno (Labrador)"
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
            <button type="submit" className="btn-eb-add income">
              <Plus size={15} /> Add Income
            </button>
          </div>
        </form>
      </section>

      <section className="dash-card eb-table-card">
        <div className="eb-table-header">
          <h3>Income Records</h3>
          <span className="eb-total income-total">
            Total:{' '}
            <strong>
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </div>
        {entries.length === 0 ? (
          <p className="eb-empty">No income recorded yet.</p>
        ) : (
          <div className="eb-table-wrapper">
            <table className="eb-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th className="text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(inc => (
                  <tr key={inc.id}>
                    <td>{inc.date}</td>
                    <td>
                      <span
                        className="category-chip"
                        style={
                          {
                            '--chip-color': SOURCE_COLORS[inc.source],
                          } as React.CSSProperties
                        }
                      >
                        {inc.source}
                      </span>
                    </td>
                    <td>{inc.description}</td>
                    <td>{inc.paymentMethod}</td>
                    <td className="text-right amount-cell income-amount">
                      ₹
                      {inc.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-row-delete"
                        onClick={() => remove(inc.id)}
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

export default FillIncome;
