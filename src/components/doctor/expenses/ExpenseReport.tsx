import { useState, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import './Expenses.css';

type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
};
type Income = {
  id: string;
  date: string;
  source: string;
  amount: number;
  description: string;
  paymentMethod: string;
};

const loadExpenses = (): Expense[] => {
  try {
    return JSON.parse(localStorage.getItem('vc_expenses') ?? '[]');
  } catch {
    return [];
  }
};

const loadIncome = (): Income[] => {
  try {
    return JSON.parse(localStorage.getItem('vc_income') ?? '[]');
  } catch {
    return [];
  }
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function groupByMonth(
  items: { date: string; amount: number }[],
): Record<string, number> {
  const result: Record<string, number> = {};
  items.forEach(({ date, amount }) => {
    const [y, m] = date.split('-');
    const key = `${y}-${m}`;
    result[key] = (result[key] ?? 0) + amount;
  });
  return result;
}

function formatMonthKey(key: string) {
  const [y, m] = key.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function ExpenseReport() {
  const [filterPeriod, setFilterPeriod] = useState<'all' | '3m' | '6m' | '1y'>(
    'all',
  );

  const allExpenses = useMemo(loadExpenses, []);
  const allIncome = useMemo(loadIncome, []);

  const cutoffDate = useMemo(() => {
    if (filterPeriod === 'all') return null;
    const d = new Date();
    const months = filterPeriod === '3m' ? 3 : filterPeriod === '6m' ? 6 : 12;
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split('T')[0];
  }, [filterPeriod]);

  const expenses = cutoffDate
    ? allExpenses.filter(e => e.date >= cutoffDate)
    : allExpenses;
  const income = cutoffDate
    ? allIncome.filter(e => e.date >= cutoffDate)
    : allIncome;

  const totalIncome = income.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const fmt = (n: number) =>
    `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Monthly breakdown
  const incomeByMonth = groupByMonth(income);
  const expensesByMonth = groupByMonth(expenses);
  const allMonthKeys = Array.from(
    new Set([...Object.keys(incomeByMonth), ...Object.keys(expensesByMonth)]),
  )
    .sort()
    .reverse();

  // Expense by category
  const expByCat: Record<string, number> = {};
  expenses.forEach(e => {
    expByCat[e.category] = (expByCat[e.category] ?? 0) + e.amount;
  });

  // Income by source
  const incBySource: Record<string, number> = {};
  income.forEach(e => {
    incBySource[e.source] = (incBySource[e.source] ?? 0) + e.amount;
  });

  const maxBar = Math.max(
    ...allMonthKeys.map(k =>
      Math.max(incomeByMonth[k] ?? 0, expensesByMonth[k] ?? 0),
    ),
    1,
  );

  return (
    <div className="expenses-page">
      <div className="report-header">
        <h1 className="dash-page-title">
          <BarChart2 size={22} /> Financial Report
        </h1>
        <div className="period-filters">
          {(['all', '3m', '6m', '1y'] as const).map(p => (
            <button
              key={p}
              type="button"
              className={`period-btn${filterPeriod === p ? ' active' : ''}`}
              onClick={() => setFilterPeriod(p)}
            >
              {p === 'all'
                ? 'All Time'
                : p === '3m'
                  ? 'Last 3M'
                  : p === '6m'
                    ? 'Last 6M'
                    : 'Last 1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="report-summary-grid">
        <div className="summary-card income-card">
          <span className="summary-label">Total Income</span>
          <span className="summary-amount">{fmt(totalIncome)}</span>
          <span className="summary-count">{income.length} entries</span>
        </div>
        <div className="summary-card expense-card">
          <span className="summary-label">Total Expenses</span>
          <span className="summary-amount">{fmt(totalExpenses)}</span>
          <span className="summary-count">{expenses.length} entries</span>
        </div>
        <div
          className={`summary-card profit-card ${netProfit >= 0 ? 'positive' : 'negative'}`}
        >
          <span className="summary-label">
            Net {netProfit >= 0 ? 'Profit' : 'Loss'}
          </span>
          <span className="summary-amount">
            {netProfit < 0 ? '-' : ''}
            {fmt(netProfit)}
          </span>
          <span className="summary-count">Income − Expenses</span>
        </div>
      </div>

      {/* Monthly bar chart */}
      {allMonthKeys.length > 0 ? (
        <section className="dash-card report-section">
          <h3 className="report-section-title">Monthly Breakdown</h3>
          <div className="bar-chart">
            {allMonthKeys.slice(0, 12).map(key => {
              const inc = incomeByMonth[key] ?? 0;
              const exp = expensesByMonth[key] ?? 0;
              return (
                <div key={key} className="bar-row">
                  <span className="bar-month">{formatMonthKey(key)}</span>
                  <div className="bar-group">
                    <div className="bar-pair">
                      <div
                        className="bar income-bar"
                        style={{ width: `${(inc / maxBar) * 100}%` }}
                        title={`Income: ${fmt(inc)}`}
                      />
                      <span className="bar-val">{fmt(inc)}</span>
                    </div>
                    <div className="bar-pair">
                      <div
                        className="bar expense-bar"
                        style={{ width: `${(exp / maxBar) * 100}%` }}
                        title={`Expenses: ${fmt(exp)}`}
                      />
                      <span className="bar-val">{fmt(exp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span>
              <span className="chart-dot income-dot" />
              Income
            </span>
            <span>
              <span className="chart-dot expense-dot" />
              Expenses
            </span>
          </div>
        </section>
      ) : (
        <div className="dash-card">
          <p className="eb-empty">No data available for the selected period.</p>
        </div>
      )}

      {/* Category / Source breakdown */}
      <div className="report-breakdown-grid">
        <section className="dash-card report-section">
          <h3 className="report-section-title">Expenses by Category</h3>
          {Object.keys(expByCat).length === 0 ? (
            <p className="eb-empty">No data</p>
          ) : (
            <table className="eb-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(expByCat)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amt]) => (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td className="text-right">{fmt(amt)}</td>
                      <td className="text-right">
                        {totalExpenses
                          ? ((amt / totalExpenses) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </section>
        <section className="dash-card report-section">
          <h3 className="report-section-title">Income by Source</h3>
          {Object.keys(incBySource).length === 0 ? (
            <p className="eb-empty">No data</p>
          ) : (
            <table className="eb-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(incBySource)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, amt]) => (
                    <tr key={src}>
                      <td>{src}</td>
                      <td className="text-right">{fmt(amt)}</td>
                      <td className="text-right">
                        {totalIncome
                          ? ((amt / totalIncome) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default ExpenseReport;
