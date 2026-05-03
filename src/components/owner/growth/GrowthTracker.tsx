import { useState } from 'react';
import { TrendingUp, Plus, X, Leaf } from 'lucide-react';
import '../dashboard/OwnerDashboard.css';
import './GrowthTracker.css';

type GrowthEntry = {
  id: string;
  petName: string;
  date: string;
  weightKg: number;
  heightCm: number;
  ageMonths: number;
  notes: string;
};

type MealSuggestion = {
  meals: string[];
  frequency: string;
  portions: string;
  avoid: string[];
  tips: string[];
};

const LS_KEY = 'vc_owner_growth_logs';

function loadLogs(): GrowthEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
}
function saveLogs(d: GrowthEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(d));
}

function getMealPlan(
  species: string,
  weightKg: number,
  ageMonths: number,
): MealSuggestion {
  const isAdult = ageMonths >= 12;
  const isLarge = weightKg >= 25;

  if (species === 'Dog') {
    if (!isAdult)
      return {
        meals: [
          'Puppy-formulated dry kibble',
          'Boiled chicken + rice',
          'Puppy wet food',
        ],
        frequency: '3–4 times per day',
        portions: `${Math.round(weightKg * 50)}–${Math.round(weightKg * 60)}g dry food/day`,
        avoid: ['Chocolate', 'Grapes', 'Onion', 'Raw bones', 'Caffeine'],
        tips: [
          'Always fresh water available',
          'Small portions frequently',
          'DHA-rich food for brain development',
        ],
      };
    return {
      meals: isLarge
        ? [
            'Large-breed dry kibble',
            'Boiled eggs',
            'Cooked fish',
            'Vegetables (carrot, sweet potato)',
          ]
        : [
            'Standard adult dry kibble',
            'Boiled chicken',
            'Cooked vegetables',
            'Curd (probiotics)',
          ],
      frequency: '2 times per day',
      portions: `${Math.round(weightKg * 25)}–${Math.round(weightKg * 35)}g dry food/day`,
      avoid: ['Chocolate', 'Avocado', 'Onion', 'Garlic', 'Raisins', 'Xylitol'],
      tips: [
        'Maintain healthy weight',
        'Adjust portions if gaining/losing weight',
        'Dental treats weekly',
      ],
    };
  }

  if (species === 'Cat') {
    return {
      meals: [
        'High-protein wet food',
        'Cat-formulated dry kibble',
        'Cooked chicken/fish (no bones)',
      ],
      frequency: isAdult ? '2 times per day' : '3–4 times per day',
      portions: `${Math.round(weightKg * 40)}–${Math.round(weightKg * 50)}g/day`,
      avoid: [
        'Onion',
        'Garlic',
        'Raw fish daily',
        'Milk (lactose)',
        'Dog food',
        'Tuna only diet',
      ],
      tips: [
        'Cats need taurine — meat-based food essential',
        'Wet food helps hydration',
        'Puzzle feeders for mental enrichment',
      ],
    };
  }

  return {
    meals: [
      'Quality hay / fodder',
      'Balanced grain mix',
      'Fresh water',
      'Mineral supplements',
    ],
    frequency: 'Ad libitum (free access)',
    portions: `Based on body weight — consult your vet`,
    avoid: ['Mouldy fodder', 'Excess salt', 'Toxic plants'],
    tips: [
      'Regular weight checks',
      'Clean feeding area',
      'Consult vet for specific nutritional needs',
    ],
  };
}

const SPECIES_OPTIONS = [
  'Dog',
  'Cat',
  'Cattle',
  'Goat',
  'Sheep',
  'Horse',
  'Rabbit',
  'Other',
];

function GrowthTracker() {
  const [logs, setLogs] = useState<GrowthEntry[]>(loadLogs);
  const [showForm, setShowForm] = useState(false);
  const [planPet, setPlanPet] = useState('');
  const [planSpecies, setPlanSpecies] = useState('Dog');
  const [form, setForm] = useState({
    petName: '',
    date: '',
    weightKg: '',
    heightCm: '',
    ageMonths: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  // Group logs by pet
  const petNames = [...new Set(logs.map(l => l.petName))];
  const [selectedPet, setSelectedPet] = useState<string>(petNames[0] ?? '');

  const petLogs = logs
    .filter(l => l.petName === (selectedPet || petNames[0]))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8); // last 8 entries for chart

  const maxWeight = Math.max(...petLogs.map(l => l.weightKg), 1);
  const maxHeight = Math.max(...petLogs.map(l => l.heightCm), 1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.petName.trim() || !form.date || !form.weightKg) {
      setFormError('Pet name, date and weight are required.');
      return;
    }
    const entry: GrowthEntry = {
      id: `g_${Date.now()}`,
      petName: form.petName,
      date: form.date,
      weightKg: parseFloat(form.weightKg) || 0,
      heightCm: parseFloat(form.heightCm) || 0,
      ageMonths: parseInt(form.ageMonths) || 0,
      notes: form.notes,
    };
    const updated = [entry, ...logs];
    setLogs(updated);
    saveLogs(updated);
    if (!selectedPet) setSelectedPet(form.petName);
    setForm({
      petName: '',
      date: '',
      weightKg: '',
      heightCm: '',
      ageMonths: '',
      notes: '',
    });
    setFormError('');
    setShowForm(false);
  }

  function deleteLog(id: string) {
    const u = logs.filter(l => l.id !== id);
    setLogs(u);
    saveLogs(u);
  }

  // Meal plan
  const planWeight = planPet
    ? (logs
        .filter(l => l.petName === planPet)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0]?.weightKg ?? 10)
    : 10;
  const planAge = planPet
    ? (logs
        .filter(l => l.petName === planPet)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0]?.ageMonths ?? 12)
    : 12;

  const mealPlan = getMealPlan(planSpecies, planWeight, planAge);

  return (
    <div className="growth-tracker">
      <div className="ov-header">
        <div>
          <h1 className="ow-page-title">Growth Tracker 📈</h1>
          <p className="ow-page-sub">
            Log weight, height and age to track your pet's growth over time.
          </p>
        </div>
        <button
          className="ow-btn ow-btn-primary"
          onClick={() => setShowForm(true)}
          type="button"
        >
          <Plus size={16} /> Log Growth
        </button>
      </div>

      {/* Chart */}
      {logs.length > 0 && (
        <div className="ow-card">
          <div className="gt-chart-header">
            <h2 className="ow-section-title">
              <TrendingUp size={18} /> Growth Chart
            </h2>
            {petNames.length > 1 && (
              <select
                className="ow-select"
                style={{ width: 'auto' }}
                value={selectedPet}
                onChange={e => setSelectedPet(e.target.value)}
              >
                {petNames.map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
          </div>

          {petLogs.length === 0 ? (
            <div className="ow-empty">
              <div className="ow-empty-icon">📊</div>No data for this pet yet.
            </div>
          ) : (
            <>
              <div className="gt-chart">
                <div className="gt-chart-legend">
                  <span className="gt-legend-dot weight" />{' '}
                  <span>Weight (kg)</span>
                  <span
                    className="gt-legend-dot height"
                    style={{ marginLeft: '14px' }}
                  />{' '}
                  <span>Height (cm)</span>
                </div>
                <div className="gt-bars">
                  {petLogs.map(entry => (
                    <div key={entry.id} className="gt-bar-group">
                      <div className="gt-bar-pair">
                        <div
                          className="gt-bar weight"
                          style={{
                            height: `${(entry.weightKg / maxWeight) * 100}%`,
                          }}
                          title={`${entry.weightKg} kg`}
                        >
                          <span className="gt-bar-val">{entry.weightKg}</span>
                        </div>
                        {entry.heightCm > 0 && (
                          <div
                            className="gt-bar height"
                            style={{
                              height: `${(entry.heightCm / maxHeight) * 100}%`,
                            }}
                            title={`${entry.heightCm} cm`}
                          >
                            <span className="gt-bar-val">{entry.heightCm}</span>
                          </div>
                        )}
                      </div>
                      <div className="gt-bar-label">{entry.date.slice(5)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gt-log-list">
                {[...petLogs].reverse().map(entry => (
                  <div key={entry.id} className="gt-log-item">
                    <div className="gt-log-date">{entry.date}</div>
                    <div className="gt-log-vals">
                      <span>⚖️ {entry.weightKg} kg</span>
                      {entry.heightCm > 0 && (
                        <span>📏 {entry.heightCm} cm</span>
                      )}
                      {entry.ageMonths > 0 && (
                        <span>🎂 {entry.ageMonths} mo</span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="gt-log-notes">{entry.notes}</div>
                    )}
                    <button
                      className="ph-delete-btn"
                      onClick={() => deleteLog(entry.id)}
                      type="button"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {logs.length === 0 && (
        <div className="ow-card">
          <div className="ow-empty">
            <div className="ow-empty-icon">📈</div>No growth data yet. Click
            "Log Growth" to start tracking.
          </div>
        </div>
      )}

      {/* Meal Plan */}
      <div className="ow-card">
        <h2 className="ow-section-title">
          <Leaf size={18} /> Nutrition & Meal Plan
        </h2>
        <div className="gt-meal-controls">
          {petNames.length > 0 && (
            <label className="ow-label" style={{ flex: 1 }}>
              Select Pet
              <select
                className="ow-select"
                value={planPet}
                onChange={e => setPlanPet(e.target.value)}
              >
                <option value="">-- Select Pet --</option>
                {petNames.map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="ow-label" style={{ flex: 1 }}>
            Species
            <select
              className="ow-select"
              value={planSpecies}
              onChange={e => setPlanSpecies(e.target.value)}
            >
              {SPECIES_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="gt-meal-plan">
          <div className="gt-meal-section">
            <div className="gt-meal-label">🍽️ Recommended Meals</div>
            <ul className="gt-meal-list">
              {mealPlan.meals.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="gt-meal-section">
            <div className="gt-meal-label">⏰ Frequency</div>
            <div className="gt-meal-value">{mealPlan.frequency}</div>
          </div>
          <div className="gt-meal-section">
            <div className="gt-meal-label">⚖️ Portions</div>
            <div className="gt-meal-value">{mealPlan.portions}</div>
          </div>
          <div className="gt-meal-section">
            <div className="gt-meal-label">🚫 Foods to Avoid</div>
            <div className="gt-avoid-list">
              {mealPlan.avoid.map((a, i) => (
                <span key={i} className="gt-avoid-tag">
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className="gt-meal-section full">
            <div className="gt-meal-label">💡 Tips</div>
            <ul className="gt-meal-list tips">
              {mealPlan.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="gt-disclaimer">
          * Suggestions are general guidelines. Always consult your vet for a
          personalised nutrition plan.
        </p>
      </div>

      {/* Log Form Modal */}
      {showForm && (
        <div className="ov-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="ov-modal" onClick={e => e.stopPropagation()}>
            <div className="ov-modal-header">
              <h3>Log Growth Entry</h3>
              <button
                className="ov-modal-close"
                onClick={() => setShowForm(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="ow-form-grid">
                <label className="ow-label">
                  Pet Name *
                  <input
                    className="ow-input"
                    value={form.petName}
                    onChange={e =>
                      setForm(p => ({ ...p, petName: e.target.value }))
                    }
                    placeholder="e.g. Buddy"
                  />
                </label>
                <label className="ow-label">
                  Date *
                  <input
                    className="ow-input"
                    type="date"
                    value={form.date}
                    onChange={e =>
                      setForm(p => ({ ...p, date: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  Weight (kg) *
                  <input
                    className="ow-input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.weightKg}
                    onChange={e =>
                      setForm(p => ({ ...p, weightKg: e.target.value }))
                    }
                    placeholder="e.g. 12.5"
                  />
                </label>
                <label className="ow-label">
                  Height (cm)
                  <input
                    className="ow-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.heightCm}
                    onChange={e =>
                      setForm(p => ({ ...p, heightCm: e.target.value }))
                    }
                    placeholder="e.g. 45"
                  />
                </label>
                <label className="ow-label">
                  Age (months)
                  <input
                    className="ow-input"
                    type="number"
                    min="0"
                    value={form.ageMonths}
                    onChange={e =>
                      setForm(p => ({ ...p, ageMonths: e.target.value }))
                    }
                    placeholder="e.g. 18"
                  />
                </label>
                <label className="ow-label">
                  Notes
                  <input
                    className="ow-input"
                    value={form.notes}
                    onChange={e =>
                      setForm(p => ({ ...p, notes: e.target.value }))
                    }
                    placeholder="Any observations..."
                  />
                </label>
              </div>
              {formError && <p className="ov-form-error">{formError}</p>}
              <div className="ov-modal-actions">
                <button
                  className="ow-btn ow-btn-secondary"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="ow-btn ow-btn-primary" type="submit">
                  <TrendingUp size={15} /> Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrowthTracker;
