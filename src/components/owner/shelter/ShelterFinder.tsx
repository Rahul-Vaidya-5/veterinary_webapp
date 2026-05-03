import { useState } from 'react';
import { Home, MapPin, Star, Phone, X, Clock, Send } from 'lucide-react';
import '../dashboard/OwnerDashboard.css';
import './ShelterFinder.css';

type ShelterRequest = {
  id: string;
  petName: string;
  shelterName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  remarks: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
};

const LS_KEY = 'vc_owner_shelter_requests';

function loadRequests(): ShelterRequest[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
}
function saveRequests(d: ShelterRequest[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(d));
}

const MOCK_SHELTERS = [
  {
    id: 's1',
    name: 'Happy Tails Shelter',
    location: 'Raipur, Chhattisgarh',
    distance: '2.4 km',
    rating: 4.8,
    capacity: 30,
    available: 8,
    species: ['Dog', 'Cat', 'Rabbit'],
    facilities: ['24/7 Care', 'Vet on Call', 'Play Area', 'CCTV'],
    contact: '+91 98765 43210',
    description:
      "A loving home-like environment for your pets while you're away. Fully equipped with medical care.",
  },
  {
    id: 's2',
    name: 'Green Paws Boarding',
    location: 'Bilaspur, Chhattisgarh',
    distance: '5.1 km',
    rating: 4.5,
    capacity: 20,
    available: 4,
    species: ['Dog', 'Cat'],
    facilities: [
      'Daily Grooming',
      'Outdoor Walks',
      'Nutritious Meals',
      'Live Updates',
    ],
    contact: '+91 87654 32109',
    description:
      'Premium boarding with personalised care for every pet. Daily photos sent to owner.',
  },
  {
    id: 's3',
    name: 'Rural Pet Haven',
    location: 'Jagdalpur, Chhattisgarh',
    distance: '12.8 km',
    rating: 4.2,
    capacity: 50,
    available: 15,
    species: ['Dog', 'Cat', 'Cattle', 'Goat', 'Horse'],
    facilities: [
      'Large Open Area',
      'Farm Setting',
      'Vet Weekly',
      'Natural Feed',
    ],
    contact: '+91 76543 21098',
    description:
      'Specialises in farm animals and large breeds. Natural open-air environment.',
  },
  {
    id: 's4',
    name: 'City Pet Hostel',
    location: 'Durg, Chhattisgarh',
    distance: '8.6 km',
    rating: 4.6,
    capacity: 25,
    available: 10,
    species: ['Dog', 'Cat'],
    facilities: ['AC Rooms', 'Premium Food', 'Swimming', 'Spa'],
    contact: '+91 65432 10987',
    description:
      'Luxury pet boarding with premium amenities. Air-conditioned rooms and spa treatments.',
  },
];

const STATUS_COLORS: Record<ShelterRequest['status'], string> = {
  Pending: 'ow-badge-amber',
  Approved: 'ow-badge-teal',
  Rejected: 'ow-badge-red',
};

const EMPTY_FORM = {
  petName: '',
  shelterName: '',
  fromDate: '',
  toDate: '',
  reason: '',
  remarks: '',
};

function ShelterFinder() {
  const [requests, setRequests] = useState<ShelterRequest[]>(loadRequests);
  const [bookingShelter, setBookingShelter] = useState<
    (typeof MOCK_SHELTERS)[0] | null
  >(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [tab, setTab] = useState<'find' | 'my'>('find');

  function handleBook(shelter: (typeof MOCK_SHELTERS)[0]) {
    setBookingShelter(shelter);
    setForm({ ...EMPTY_FORM, shelterName: shelter.name });
    setFormError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.petName.trim() ||
      !form.fromDate ||
      !form.toDate ||
      !form.reason.trim()
    ) {
      setFormError('Pet name, dates and reason are required.');
      return;
    }
    if (new Date(form.toDate) <= new Date(form.fromDate)) {
      setFormError('End date must be after start date.');
      return;
    }
    const req: ShelterRequest = {
      id: `sh_${Date.now()}`,
      ...form,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    const updated = [req, ...requests];
    setRequests(updated);
    saveRequests(updated);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setBookingShelter(null);
    setTab('my');
  }

  function deleteRequest(id: string) {
    const u = requests.filter(r => r.id !== id);
    setRequests(u);
    saveRequests(u);
  }

  return (
    <div className="shelter-finder">
      <div className="ov-header">
        <div>
          <h1 className="ow-page-title">Shelter Home 🏠</h1>
          <p className="ow-page-sub">
            Find a safe and caring shelter for your pet when you need it.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="ph-tabs">
        <button
          className={`ph-tab${tab === 'find' ? ' active' : ''}`}
          onClick={() => setTab('find')}
          type="button"
        >
          <Home size={15} /> Find Shelter
        </button>
        <button
          className={`ph-tab${tab === 'my' ? ' active' : ''}`}
          onClick={() => setTab('my')}
          type="button"
        >
          <Clock size={15} /> My Requests ({requests.length})
        </button>
      </div>

      {/* Shelter Cards */}
      {tab === 'find' && (
        <div className="sf-shelter-grid">
          {MOCK_SHELTERS.map(s => (
            <div key={s.id} className="sf-shelter-card">
              <div className="sf-shelter-top">
                <div>
                  <div className="sf-shelter-name">{s.name}</div>
                  <div className="sf-shelter-location">
                    <MapPin size={12} /> {s.location} · {s.distance}
                  </div>
                </div>
                <div className="sf-shelter-rating">
                  <Star size={13} /> {s.rating}
                </div>
              </div>

              <p className="sf-shelter-desc">{s.description}</p>

              <div className="sf-shelter-meta">
                <div className="sf-shelter-cap">
                  <span className="sf-cap-label">Capacity</span>
                  <span className="sf-cap-val">
                    {s.available}/{s.capacity} available
                  </span>
                  <div className="sf-cap-bar">
                    <div
                      className="sf-cap-fill"
                      style={{ width: `${(s.available / s.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="sf-shelter-contact">
                  <Phone size={12} /> {s.contact}
                </div>
              </div>

              <div className="sf-shelter-tags">
                {s.species.map(sp => (
                  <span key={sp} className="ow-badge ow-badge-amber">
                    {sp}
                  </span>
                ))}
              </div>

              <div className="sf-facilities">
                {s.facilities.map(f => (
                  <span key={f} className="sf-facility-tag">
                    {f}
                  </span>
                ))}
              </div>

              <button
                className="ow-btn ow-btn-primary"
                style={{
                  width: '100%',
                  marginTop: '12px',
                  justifyContent: 'center',
                }}
                onClick={() => handleBook(s)}
                type="button"
                disabled={s.available === 0}
              >
                {s.available === 0 ? (
                  'Fully Booked'
                ) : (
                  <>
                    <Send size={14} /> Request Stay
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My Requests */}
      {tab === 'my' && (
        <div className="ow-card">
          {requests.length === 0 ? (
            <div className="ow-empty">
              <div className="ow-empty-icon">🏠</div>No shelter requests yet.
              Find a shelter and book a stay!
            </div>
          ) : (
            <div className="sf-request-list">
              {requests.map(r => (
                <div key={r.id} className="sf-request-item">
                  <div className="sf-request-header">
                    <div className="sf-request-shelter">{r.shelterName}</div>
                    <span className={`ow-badge ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="sf-request-pet">🐾 {r.petName}</div>
                  <div className="sf-request-dates">
                    <Clock size={12} /> {r.fromDate} → {r.toDate}
                  </div>
                  <div className="sf-request-reason">Reason: {r.reason}</div>
                  {r.remarks && (
                    <div className="sf-request-remarks">
                      Remarks: "{r.remarks}"
                    </div>
                  )}
                  {r.status === 'Pending' && (
                    <button
                      className="ow-btn ow-btn-danger"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        marginTop: '8px',
                      }}
                      onClick={() => deleteRequest(r.id)}
                      type="button"
                    >
                      <X size={13} /> Withdraw
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingShelter && (
        <div
          className="ov-modal-overlay"
          onClick={() => setBookingShelter(null)}
        >
          <div
            className="ov-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '540px' }}
          >
            <div className="ov-modal-header">
              <h3>Request Stay — {bookingShelter.name}</h3>
              <button
                className="ov-modal-close"
                onClick={() => setBookingShelter(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="ow-form-grid">
                <label className="ow-label full">
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
                  From Date *
                  <input
                    className="ow-input"
                    type="date"
                    value={form.fromDate}
                    onChange={e =>
                      setForm(p => ({ ...p, fromDate: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  To Date *
                  <input
                    className="ow-input"
                    type="date"
                    value={form.toDate}
                    onChange={e =>
                      setForm(p => ({ ...p, toDate: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label full">
                  Reason for Stay *
                  <input
                    className="ow-input"
                    value={form.reason}
                    onChange={e =>
                      setForm(p => ({ ...p, reason: e.target.value }))
                    }
                    placeholder="e.g. Out of town for a week, medical reason..."
                  />
                </label>
                <label className="ow-label full">
                  Special Remarks for Shelter
                  <textarea
                    className="ow-textarea"
                    value={form.remarks}
                    onChange={e =>
                      setForm(p => ({ ...p, remarks: e.target.value }))
                    }
                    placeholder="Any allergies, habits, special care instructions..."
                  />
                </label>
              </div>
              {formError && <p className="ov-form-error">{formError}</p>}
              <div className="ov-modal-actions">
                <button
                  className="ow-btn ow-btn-secondary"
                  type="button"
                  onClick={() => setBookingShelter(null)}
                >
                  Cancel
                </button>
                <button className="ow-btn ow-btn-primary" type="submit">
                  <Send size={15} /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShelterFinder;
