import { useState } from 'react';
import { Calendar, Plus, Trash2, Clock, MapPin, User, X } from 'lucide-react';
import '../dashboard/OwnerDashboard.css';
import './BookAppointment.css';

type Appointment = {
  id: string;
  petName: string;
  doctorName: string;
  clinicName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  bookedAt: string;
};

const LS_KEY = 'vc_owner_appointments';

function loadAppointments(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveAppointments(data: Appointment[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// Mock registered doctors — in a real app, read from vc_doctors
const MOCK_DOCTORS = [
  {
    name: 'Dr. Arjun Sharma',
    clinic: 'Happy Paws Clinic',
    location: 'Raipur',
    speciality: 'Small Animals',
  },
  {
    name: 'Dr. Priya Soni',
    clinic: 'Green Pastures Vet',
    location: 'Bilaspur',
    speciality: 'Livestock',
  },
  {
    name: 'Dr. Rohit Verma',
    clinic: 'City Vet Centre',
    location: 'Durg',
    speciality: 'General Practice',
  },
  {
    name: 'Dr. Anita Pandey',
    clinic: 'Paws & Claws Clinic',
    location: 'Bhilai',
    speciality: 'Surgery & Ortho',
  },
  {
    name: 'Dr. Manoj Kumar',
    clinic: 'Rural Vet Services',
    location: 'Jagdalpur',
    speciality: 'Farm Animals',
  },
];

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

const EMPTY_FORM = {
  petName: '',
  doctorName: '',
  clinicName: '',
  date: '',
  time: '',
  reason: '',
};

const STATUS_COLORS: Record<Appointment['status'], string> = {
  Pending: 'ow-badge-amber',
  Confirmed: 'ow-badge-teal',
  Completed: '',
  Cancelled: 'ow-badge-red',
};

function BookAppointment() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(loadAppointments);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<
    (typeof MOCK_DOCTORS)[0] | null
  >(null);

  function handleDoctorSelect(name: string) {
    const doc = MOCK_DOCTORS.find(d => d.name === name) ?? null;
    setSelectedDoctor(doc);
    setForm(p => ({ ...p, doctorName: name, clinicName: doc?.clinic ?? '' }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.petName.trim() || !form.doctorName || !form.date || !form.time) {
      setFormError('Pet name, doctor, date and time are required.');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(form.date) < today) {
      setFormError('Please select a future date.');
      return;
    }
    const appt: Appointment = {
      id: `appt_${Date.now()}`,
      petName: form.petName,
      doctorName: form.doctorName,
      clinicName: form.clinicName,
      date: form.date,
      time: form.time,
      reason: form.reason,
      status: 'Pending',
      bookedAt: new Date().toISOString(),
    };
    const updated = [appt, ...appointments];
    setAppointments(updated);
    saveAppointments(updated);
    setForm({ ...EMPTY_FORM });
    setSelectedDoctor(null);
    setFormError('');
    setShowForm(false);
  }

  function handleCancel(id: string) {
    const updated = appointments.map(a =>
      a.id === id ? { ...a, status: 'Cancelled' as const } : a,
    );
    setAppointments(updated);
    saveAppointments(updated);
  }

  function handleDelete(id: string) {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    saveAppointments(updated);
  }

  const upcoming = appointments.filter(
    a => a.status === 'Pending' || a.status === 'Confirmed',
  );
  const past = appointments.filter(
    a => a.status === 'Completed' || a.status === 'Cancelled',
  );

  return (
    <div className="book-appt">
      <div className="ov-header">
        <div>
          <h1 className="ow-page-title">Book Appointment 📅</h1>
          <p className="ow-page-sub">
            Schedule a visit with a registered veterinary doctor.
          </p>
        </div>
        <button
          className="ow-btn ow-btn-primary"
          onClick={() => setShowForm(true)}
          type="button"
        >
          <Plus size={16} /> New Appointment
        </button>
      </div>

      {/* Doctor Directory */}
      <div className="ow-card">
        <h2 className="ow-section-title">
          <User size={18} /> Available Doctors
        </h2>
        <div className="ba-doctor-grid">
          {MOCK_DOCTORS.map(doc => (
            <div key={doc.name} className="ba-doctor-card">
              <div className="ba-doctor-avatar">🩺</div>
              <div className="ba-doctor-info">
                <div className="ba-doctor-name">{doc.name}</div>
                <div className="ba-doctor-clinic">{doc.clinic}</div>
                <div className="ba-doctor-meta">
                  <span>
                    <MapPin size={11} /> {doc.location}
                  </span>
                  <span className="ow-badge ow-badge-teal">
                    {doc.speciality}
                  </span>
                </div>
              </div>
              <button
                className="ow-btn ow-btn-primary ba-book-quick"
                type="button"
                onClick={() => {
                  handleDoctorSelect(doc.name);
                  setShowForm(true);
                }}
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="ow-card">
          <h2 className="ow-section-title">
            <Clock size={18} /> Upcoming Appointments
          </h2>
          <div className="ba-appt-list">
            {upcoming.map(a => (
              <div key={a.id} className="ba-appt-item">
                <div className="ba-appt-date-col">
                  <div className="ba-appt-date">{a.date}</div>
                  <div className="ba-appt-time">{a.time}</div>
                </div>
                <div className="ba-appt-body">
                  <div className="ba-appt-pet">🐾 {a.petName}</div>
                  <div className="ba-appt-doctor">
                    {a.doctorName} · {a.clinicName}
                  </div>
                  {a.reason && (
                    <div className="ba-appt-reason">"{a.reason}"</div>
                  )}
                </div>
                <div className="ba-appt-actions">
                  <span className={`ow-badge ${STATUS_COLORS[a.status]}`}>
                    {a.status}
                  </span>
                  {a.status === 'Pending' && (
                    <button
                      className="ow-btn ow-btn-danger"
                      style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleCancel(a.id)}
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="ow-card">
          <h2 className="ow-section-title">
            <Calendar size={18} /> Past Appointments
          </h2>
          <div className="ba-appt-list ba-past">
            {past.map(a => (
              <div key={a.id} className="ba-appt-item">
                <div className="ba-appt-date-col">
                  <div className="ba-appt-date">{a.date}</div>
                  <div className="ba-appt-time">{a.time}</div>
                </div>
                <div className="ba-appt-body">
                  <div className="ba-appt-pet">🐾 {a.petName}</div>
                  <div className="ba-appt-doctor">
                    {a.doctorName} · {a.clinicName}
                  </div>
                </div>
                <div className="ba-appt-actions">
                  <span className={`ow-badge ${STATUS_COLORS[a.status]}`}>
                    {a.status}
                  </span>
                  <button
                    className="ow-btn ow-btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                    onClick={() => handleDelete(a.id)}
                    type="button"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="ow-card">
          <div className="ow-empty">
            <div className="ow-empty-icon">📅</div>No appointments yet. Book
            your first one above!
          </div>
        </div>
      )}

      {/* Book Form Modal */}
      {showForm && (
        <div className="ov-modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="ov-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '560px' }}
          >
            <div className="ov-modal-header">
              <h3>Book an Appointment</h3>
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
                  Doctor *
                  <select
                    className="ow-select"
                    value={form.doctorName}
                    onChange={e => handleDoctorSelect(e.target.value)}
                  >
                    <option value="">-- Select Doctor --</option>
                    {MOCK_DOCTORS.map(d => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedDoctor && (
                  <div className="full ba-selected-doctor">
                    <MapPin size={13} /> {selectedDoctor.clinic},{' '}
                    {selectedDoctor.location}
                  </div>
                )}
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
                  Time Slot *
                  <select
                    className="ow-select"
                    value={form.time}
                    onChange={e =>
                      setForm(p => ({ ...p, time: e.target.value }))
                    }
                  >
                    <option value="">-- Select Time --</option>
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ow-label full">
                  Reason / Symptoms
                  <textarea
                    className="ow-textarea"
                    value={form.reason}
                    onChange={e =>
                      setForm(p => ({ ...p, reason: e.target.value }))
                    }
                    placeholder="Describe what's wrong or purpose of visit..."
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
                  <Calendar size={15} /> Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookAppointment;
