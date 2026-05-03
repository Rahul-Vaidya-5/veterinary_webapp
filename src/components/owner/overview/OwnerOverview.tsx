import { useState } from 'react';
import {
  PawPrint,
  Plus,
  Trash2,
  Bell,
  Calendar,
  Heart,
  TrendingUp,
  Home,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOwnerInfo } from '../dashboard/OwnerDashboard';
import '../dashboard/OwnerDashboard.css';
import './OwnerOverview.css';

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dateOfBirth: string;
  identificationMark: string;
};

type VaccinationReminder = {
  petName: string;
  vaccine: string;
  dueDate: string;
  daysLeft: number;
};

const LS_OWNER_PETS = 'vc_owner_pets';

function loadPets(): Pet[] {
  try {
    return JSON.parse(localStorage.getItem(LS_OWNER_PETS) ?? '[]');
  } catch {
    return [];
  }
}

function savePets(pets: Pet[]) {
  localStorage.setItem(LS_OWNER_PETS, JSON.stringify(pets));
}

function calcAge(dob: string): string {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(
    (diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44),
  );
  if (years > 0) return `${years}y ${months}m`;
  return `${months} months`;
}

function getVaccinationReminders(pets: Pet[]): VaccinationReminder[] {
  const reminders: VaccinationReminder[] = [];
  pets.forEach(pet => {
    const key = `vc_vaccinations_${pet.name.toLowerCase().replace(/\s/g, '_')}`;
    try {
      const records = JSON.parse(localStorage.getItem(key) ?? '[]') as Array<{
        vaccine: string;
        nextDue: string;
      }>;
      records.forEach(r => {
        if (!r.nextDue) return;
        const due = new Date(r.nextDue);
        const daysLeft = Math.ceil(
          (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        if (daysLeft <= 30) {
          reminders.push({
            petName: pet.name,
            vaccine: r.vaccine,
            dueDate: r.nextDue,
            daysLeft,
          });
        }
      });
    } catch {
      /* ignore */
    }
  });
  return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
}

const SPECIES_EMOJIS: Record<string, string> = {
  Dog: '🐕',
  Cat: '🐈',
  Cattle: '🐄',
  Cow: '🐄',
  Buffalo: '🐃',
  Goat: '🐐',
  Sheep: '🐑',
  Horse: '🐎',
  Rabbit: '🐇',
};

function speciesEmoji(s: string) {
  return SPECIES_EMOJIS[s] ?? '🐾';
}

const EMPTY_PET: Omit<Pet, 'id'> = {
  name: '',
  species: '',
  breed: '',
  gender: '',
  dateOfBirth: '',
  identificationMark: '',
};

const SPECIES_OPTIONS = [
  'Dog',
  'Cat',
  'Cattle',
  'Goat',
  'Sheep',
  'Horse',
  'Rabbit',
  'Buffalo',
  'Other',
];

function OwnerOverview() {
  const owner = useOwnerInfo();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>(loadPets);
  const [showAddPet, setShowAddPet] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_PET });
  const [formError, setFormError] = useState('');

  const reminders = getVaccinationReminders(pets);

  function handleAddPet(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.species.trim() || !form.breed.trim()) {
      setFormError('Name, species, and breed are required.');
      return;
    }
    const newPet: Pet = { ...form, id: `pet_${Date.now()}` };
    const updated = [...pets, newPet];
    setPets(updated);
    savePets(updated);
    setForm({ ...EMPTY_PET });
    setFormError('');
    setShowAddPet(false);
  }

  function handleRemovePet(id: string) {
    const updated = pets.filter(p => p.id !== id);
    setPets(updated);
    savePets(updated);
  }

  const quickActions = [
    {
      label: 'Book Appointment',
      icon: <Calendar size={20} />,
      path: '../appointments',
      color: '#fef3c7',
      accent: '#d97706',
    },
    {
      label: 'Pet Health',
      icon: <Heart size={20} />,
      path: '../health',
      color: '#fce7f3',
      accent: '#be185d',
    },
    {
      label: 'Growth Tracker',
      icon: <TrendingUp size={20} />,
      path: '../growth',
      color: '#e0f2f1',
      accent: '#00695c',
    },
    {
      label: 'Shelter Home',
      icon: <Home size={20} />,
      path: '../shelter',
      color: '#fff7ed',
      accent: '#c2410c',
    },
    {
      label: 'Pet Connect',
      icon: <Users size={20} />,
      path: '../connect',
      color: '#ede9fe',
      accent: '#5b21b6',
    },
  ];

  return (
    <div className="owner-overview">
      {/* Header */}
      <div className="ov-header">
        <div>
          <h1 className="ow-page-title">Welcome, {owner.ownerName}! 🐾</h1>
          <p className="ow-page-sub">
            Manage your pets' health, schedule and care — all in one place.
          </p>
        </div>
        <button
          className="ow-btn ow-btn-primary"
          onClick={() => setShowAddPet(true)}
          type="button"
        >
          <Plus size={16} /> Add Pet
        </button>
      </div>

      {/* Vaccination Reminders */}
      {reminders.length > 0 && (
        <div className="ov-reminders">
          <div className="ov-reminder-title">
            <Bell size={16} /> Upcoming Vaccination Reminders
          </div>
          <div className="ov-reminder-list">
            {reminders.map((r, i) => (
              <div
                key={i}
                className={`ov-reminder-item${r.daysLeft <= 7 ? ' urgent' : ''}`}
              >
                <span className="ov-reminder-pet">
                  {speciesEmoji('Dog')} {r.petName}
                </span>
                <span className="ov-reminder-vaccine">{r.vaccine}</span>
                <span className="ov-reminder-due">
                  {r.daysLeft <= 0
                    ? 'Overdue!'
                    : r.daysLeft === 1
                      ? 'Due tomorrow'
                      : `In ${r.daysLeft} days`}
                  <span className="ov-reminder-date"> · {r.dueDate}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="ov-quick-actions">
        {quickActions.map(a => (
          <button
            key={a.label}
            className="ov-quick-card"
            style={
              {
                '--qa-bg': a.color,
                '--qa-accent': a.accent,
              } as React.CSSProperties
            }
            onClick={() => navigate(a.path, { relative: 'path' })}
            type="button"
          >
            <span className="ov-quick-icon">{a.icon}</span>
            <span className="ov-quick-label">{a.label}</span>
          </button>
        ))}
      </div>

      {/* My Pets */}
      <div className="ow-card">
        <div className="ov-pets-header">
          <h2 className="ow-section-title">
            <PawPrint size={18} /> My Pets
          </h2>
          <span className="ow-badge ow-badge-amber">
            {pets.length} registered
          </span>
        </div>

        {pets.length === 0 ? (
          <div className="ow-empty">
            <div className="ow-empty-icon">🐾</div>
            No pets added yet. Click "Add Pet" to register your first pet.
          </div>
        ) : (
          <div className="ov-pet-grid">
            {pets.map(pet => (
              <div key={pet.id} className="ov-pet-card">
                <div className="ov-pet-emoji">{speciesEmoji(pet.species)}</div>
                <div className="ov-pet-info">
                  <div className="ov-pet-name">{pet.name}</div>
                  <div className="ov-pet-meta">
                    {pet.species} · {pet.breed}
                  </div>
                  <div className="ov-pet-meta">
                    {pet.gender && <span>{pet.gender}</span>}
                    {pet.dateOfBirth && (
                      <span> · Age: {calcAge(pet.dateOfBirth)}</span>
                    )}
                  </div>
                  {pet.identificationMark && (
                    <div className="ov-pet-id-mark">
                      🔖 {pet.identificationMark}
                    </div>
                  )}
                </div>
                <button
                  className="ov-pet-remove"
                  onClick={() => handleRemovePet(pet.id)}
                  title="Remove pet"
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Pet Modal */}
      {showAddPet && (
        <div className="ov-modal-overlay" onClick={() => setShowAddPet(false)}>
          <div className="ov-modal" onClick={e => e.stopPropagation()}>
            <div className="ov-modal-header">
              <h3>Add a Pet</h3>
              <button
                className="ov-modal-close"
                onClick={() => setShowAddPet(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddPet}>
              <div className="ow-form-grid">
                <label className="ow-label">
                  Pet Name *
                  <input
                    className="ow-input"
                    value={form.name}
                    onChange={e =>
                      setForm(p => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Buddy"
                  />
                </label>
                <label className="ow-label">
                  Species *
                  <select
                    className="ow-select"
                    value={form.species}
                    onChange={e =>
                      setForm(p => ({ ...p, species: e.target.value }))
                    }
                  >
                    <option value="">-- Select --</option>
                    {SPECIES_OPTIONS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ow-label">
                  Breed *
                  <input
                    className="ow-input"
                    value={form.breed}
                    onChange={e =>
                      setForm(p => ({ ...p, breed: e.target.value }))
                    }
                    placeholder="e.g. Labrador"
                  />
                </label>
                <label className="ow-label">
                  Gender
                  <select
                    className="ow-select"
                    value={form.gender}
                    onChange={e =>
                      setForm(p => ({ ...p, gender: e.target.value }))
                    }
                  >
                    <option value="">-- Select --</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </label>
                <label className="ow-label">
                  Date of Birth
                  <input
                    className="ow-input"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e =>
                      setForm(p => ({ ...p, dateOfBirth: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  Identification Mark
                  <input
                    className="ow-input"
                    value={form.identificationMark}
                    onChange={e =>
                      setForm(p => ({
                        ...p,
                        identificationMark: e.target.value,
                      }))
                    }
                    placeholder="e.g. White patch on ear"
                  />
                </label>
              </div>
              {formError && <p className="ov-form-error">{formError}</p>}
              <div className="ov-modal-actions">
                <button
                  className="ow-btn ow-btn-secondary"
                  type="button"
                  onClick={() => setShowAddPet(false)}
                >
                  Cancel
                </button>
                <button className="ow-btn ow-btn-primary" type="submit">
                  <Plus size={15} /> Add Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerOverview;
