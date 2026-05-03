import { useEffect, useState } from 'react';
import { Users, Plus, X, Heart, MapPin, Phone, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../dashboard/OwnerDashboard.css';
import './PetConnect.css';

type ConnectRequest = {
  id: string;
  petName: string;
  species: string;
  breed: string;
  gender: string;
  ageMonths: number;
  location: string;
  ownerName: string;
  contactNumber: string;
  description: string;
  postedAt: string;
  isMine: boolean;
};

type BreedingInterest = {
  id: string;
  myPetName: string;
  targetRequestId: string;
  targetPetName: string;
  targetOwner: string;
  message: string;
  sentAt: string;
};

const LS_REQUESTS = 'vc_pet_connect_requests';
const LS_INTERESTS = 'vc_pet_connect_interests';

function loadRequests(): ConnectRequest[] {
  try {
    return JSON.parse(localStorage.getItem(LS_REQUESTS) ?? '[]');
  } catch {
    return [];
  }
}
function loadInterests(): BreedingInterest[] {
  try {
    return JSON.parse(localStorage.getItem(LS_INTERESTS) ?? '[]');
  } catch {
    return [];
  }
}
function saveRequests(d: ConnectRequest[]) {
  localStorage.setItem(LS_REQUESTS, JSON.stringify(d));
}
function saveInterests(d: BreedingInterest[]) {
  localStorage.setItem(LS_INTERESTS, JSON.stringify(d));
}

// Seeded community posts (not mine)
const SEED_POSTS: ConnectRequest[] = [
  {
    id: 'seed1',
    petName: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    ageMonths: 24,
    location: 'Raipur, CG',
    ownerName: 'Rahul Singh',
    contactNumber: '+91 98765 43210',
    description:
      'Healthy, vaccinated Golden Retriever looking to connect with a female Golden. All health records available.',
    postedAt: '2026-04-20',
    isMine: false,
  },
  {
    id: 'seed2',
    petName: 'Luna',
    species: 'Cat',
    breed: 'Persian',
    gender: 'Female',
    ageMonths: 18,
    location: 'Bilaspur, CG',
    ownerName: 'Priya Sharma',
    contactNumber: '+91 87654 32109',
    description:
      'Beautiful Persian cat, fully vaccinated and healthy. Looking for a male Persian for breeding.',
    postedAt: '2026-04-22',
    isMine: false,
  },
  {
    id: 'seed3',
    petName: 'Bruno',
    species: 'Dog',
    breed: 'Labrador',
    gender: 'Male',
    ageMonths: 30,
    location: 'Durg, CG',
    ownerName: 'Amit Verma',
    contactNumber: '+91 76543 21098',
    description:
      'Champion Labrador, pedigree certified. Excellent temperament. Seeking female Labrador.',
    postedAt: '2026-04-18',
    isMine: false,
  },
  {
    id: 'seed4',
    petName: 'Bella',
    species: 'Dog',
    breed: 'German Shepherd',
    gender: 'Female',
    ageMonths: 22,
    location: 'Raipur, CG',
    ownerName: 'Sunita Patel',
    contactNumber: '+91 65432 10987',
    description:
      'Purebred German Shepherd, police dog lineage. All documents available.',
    postedAt: '2026-04-15',
    isMine: false,
  },
];

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
const EMPTY_FORM = {
  petName: '',
  species: '',
  breed: '',
  gender: '',
  ageMonths: '',
  location: '',
  ownerName: '',
  contactNumber: '',
  description: '',
};

const SPECIES_EMOJIS: Record<string, string> = {
  Dog: '🐕',
  Cat: '🐈',
  Cattle: '🐄',
  Goat: '🐐',
  Sheep: '🐑',
  Horse: '🐎',
  Rabbit: '🐇',
};

function PetConnect() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMyRequestsRoute = location.pathname.endsWith('/my-requests');

  const [myPosts, setMyPosts] = useState<ConnectRequest[]>(() => {
    const saved = loadRequests();
    return saved.length > 0 ? saved : [];
  });
  const [interests, setInterests] = useState<BreedingInterest[]>(loadInterests);
  const [showPostForm, setShowPostForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [tab, setTab] = useState<'browse' | 'mine'>(() =>
    isMyRequestsRoute ? 'mine' : 'browse',
  );
  const [connectTarget, setConnectTarget] = useState<ConnectRequest | null>(
    null,
  );
  const [connectForm, setConnectForm] = useState({
    myPetName: '',
    message: '',
  });
  const [connectError, setConnectError] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');

  const browseList = [...SEED_POSTS, ...myPosts]
    .filter(p => !p.isMine)
    .filter(p => !filterSpecies || p.species === filterSpecies);

  useEffect(() => {
    setTab(isMyRequestsRoute ? 'mine' : 'browse');
  }, [isMyRequestsRoute]);

  function openBrowseTab() {
    setTab('browse');
    if (isMyRequestsRoute) {
      navigate('/owner/dashboard/connect');
    }
  }

  function openMineTab() {
    setTab('mine');
    if (!isMyRequestsRoute) {
      navigate('/owner/dashboard/connect/my-requests');
    }
  }

  function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.petName.trim() ||
      !form.species ||
      !form.breed.trim() ||
      !form.gender ||
      !form.location.trim() ||
      !form.ownerName.trim() ||
      !form.contactNumber.trim()
    ) {
      setFormError('All fields marked * are required.');
      return;
    }
    const req: ConnectRequest = {
      id: `pc_${Date.now()}`,
      petName: form.petName,
      species: form.species,
      breed: form.breed,
      gender: form.gender,
      ageMonths: parseInt(form.ageMonths) || 0,
      location: form.location,
      ownerName: form.ownerName,
      contactNumber: form.contactNumber,
      description: form.description,
      postedAt: new Date().toISOString().slice(0, 10),
      isMine: true,
    };
    const updated = [req, ...myPosts];
    setMyPosts(updated);
    saveRequests(updated);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowPostForm(false);
    openMineTab();
  }

  function handleSendInterest(e: React.FormEvent) {
    e.preventDefault();
    if (!connectTarget) return;
    if (!connectForm.myPetName.trim()) {
      setConnectError("Your pet's name is required.");
      return;
    }
    const interest: BreedingInterest = {
      id: `bi_${Date.now()}`,
      myPetName: connectForm.myPetName,
      targetRequestId: connectTarget.id,
      targetPetName: connectTarget.petName,
      targetOwner: connectTarget.ownerName,
      message: connectForm.message,
      sentAt: new Date().toISOString(),
    };
    const updated = [interest, ...interests];
    setInterests(updated);
    saveInterests(updated);
    setConnectForm({ myPetName: '', message: '' });
    setConnectError('');
    setConnectTarget(null);
  }

  function deleteMyPost(id: string) {
    const u = myPosts.filter(p => p.id !== id);
    setMyPosts(u);
    saveRequests(u);
  }

  return (
    <div className="pet-connect">
      <div className="ov-header">
        <div>
          <h1 className="ow-page-title">Pet Connect 🤝</h1>
          <p className="ow-page-sub">
            Find breeding matches and connect your pets with others in the
            community.
          </p>
        </div>
        <button
          className="ow-btn ow-btn-primary"
          onClick={() => setShowPostForm(true)}
          type="button"
        >
          <Plus size={16} /> Post a Request
        </button>
      </div>

      {/* Tabs */}
      <div className="ph-tabs">
        <button
          className={`ph-tab${tab === 'browse' ? ' active' : ''}`}
          onClick={openBrowseTab}
          type="button"
        >
          <Users size={15} /> Community ({browseList.length})
        </button>
        <button
          className={`ph-tab${tab === 'mine' ? ' active' : ''}`}
          onClick={openMineTab}
          type="button"
        >
          <Heart size={15} /> My Posts & Interests
        </button>
      </div>

      {/* Browse */}
      {tab === 'browse' && (
        <>
          <div className="pc-filter-bar">
            <label
              className="ow-label"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                margin: 0,
              }}
            >
              Filter by species:
              <select
                className="ow-select"
                style={{ width: 'auto' }}
                value={filterSpecies}
                onChange={e => setFilterSpecies(e.target.value)}
              >
                <option value="">All Species</option>
                {SPECIES_OPTIONS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="pc-card-grid">
            {[...SEED_POSTS, ...myPosts.filter(p => p.isMine === false)]
              .filter(p => !filterSpecies || p.species === filterSpecies)
              .map(post => (
                <div key={post.id} className="pc-post-card">
                  <div className="pc-post-top">
                    <div className="pc-pet-emoji">
                      {SPECIES_EMOJIS[post.species] ?? '🐾'}
                    </div>
                    <div className="pc-post-header">
                      <div className="pc-pet-name">{post.petName}</div>
                      <div className="pc-pet-meta">
                        {post.species} · {post.breed} · {post.gender}
                      </div>
                      {post.ageMonths > 0 && (
                        <div className="pc-pet-meta">
                          {post.ageMonths} months old
                        </div>
                      )}
                    </div>
                    <div className="pc-post-gender">
                      {post.gender === 'Male' ? '♂' : '♀'}
                    </div>
                  </div>
                  {post.description && (
                    <p className="pc-post-desc">{post.description}</p>
                  )}
                  <div className="pc-post-footer">
                    <span>
                      <MapPin size={11} /> {post.location}
                    </span>
                    <span>📅 {post.postedAt}</span>
                  </div>
                  <div className="pc-owner-row">
                    <span>👤 {post.ownerName}</span>
                    <span>
                      <Phone size={11} /> {post.contactNumber}
                    </span>
                  </div>
                  <button
                    className="ow-btn ow-btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      marginTop: '10px',
                    }}
                    onClick={() => {
                      setConnectTarget(post);
                      setConnectError('');
                      setConnectForm({ myPetName: '', message: '' });
                    }}
                    type="button"
                  >
                    <Heart size={14} /> Show Interest
                  </button>
                </div>
              ))}
          </div>

          {[...SEED_POSTS, ...myPosts]
            .filter(p => !p.isMine)
            .filter(p => !filterSpecies || p.species === filterSpecies)
            .length === 0 && (
            <div className="ow-card">
              <div className="ow-empty">
                <div className="ow-empty-icon">🔍</div>No posts found for
                selected species.
              </div>
            </div>
          )}
        </>
      )}

      {/* My Posts & Interests */}
      {tab === 'mine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ow-card">
            <h2 className="ow-section-title">
              <Users size={18} /> My Connection Posts
            </h2>
            {myPosts.filter(p => p.isMine).length === 0 ? (
              <div className="ow-empty">
                <div className="ow-empty-icon">📢</div>You haven't posted any
                connection requests yet.
              </div>
            ) : (
              <div className="pc-mine-list">
                {myPosts
                  .filter(p => p.isMine)
                  .map(p => (
                    <div key={p.id} className="pc-mine-item">
                      <div
                        className="pc-pet-emoji"
                        style={{ fontSize: '1.8rem' }}
                      >
                        {SPECIES_EMOJIS[p.species] ?? '🐾'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="pc-pet-name">
                          {p.petName}{' '}
                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: '0.78rem',
                              color: '#6b7280',
                            }}
                          >
                            ({p.species} · {p.breed} · {p.gender})
                          </span>
                        </div>
                        <div className="pc-pet-meta">
                          <MapPin size={11} /> {p.location} · {p.postedAt}
                        </div>
                        {p.description && (
                          <div
                            className="pc-post-desc"
                            style={{ marginTop: '4px' }}
                          >
                            {p.description}
                          </div>
                        )}
                      </div>
                      <button
                        className="ph-delete-btn"
                        onClick={() => deleteMyPost(p.id)}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="ow-card">
            <h2 className="ow-section-title">
              <Heart size={18} /> Interests I've Sent
            </h2>
            {interests.length === 0 ? (
              <div className="ow-empty">
                <div className="ow-empty-icon">💌</div>No interests sent yet.
              </div>
            ) : (
              <div className="pc-mine-list">
                {interests.map(i => (
                  <div key={i.id} className="pc-mine-item">
                    <div style={{ fontSize: '1.5rem' }}>💌</div>
                    <div style={{ flex: 1 }}>
                      <div className="pc-pet-name">
                        My pet: {i.myPetName} → {i.targetPetName}
                      </div>
                      <div className="pc-pet-meta">
                        Owner: {i.targetOwner} ·{' '}
                        {new Date(i.sentAt).toLocaleDateString()}
                      </div>
                      {i.message && (
                        <div
                          className="pc-post-desc"
                          style={{ marginTop: '3px' }}
                        >
                          "{i.message}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <div
          className="ov-modal-overlay"
          onClick={() => setShowPostForm(false)}
        >
          <div
            className="ov-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '560px' }}
          >
            <div className="ov-modal-header">
              <h3>Post a Connection Request</h3>
              <button
                className="ov-modal-close"
                onClick={() => setShowPostForm(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePostSubmit}>
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
                  Gender *
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
                  Age (months)
                  <input
                    className="ow-input"
                    type="number"
                    min="0"
                    value={form.ageMonths}
                    onChange={e =>
                      setForm(p => ({ ...p, ageMonths: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  Location *
                  <input
                    className="ow-input"
                    value={form.location}
                    onChange={e =>
                      setForm(p => ({ ...p, location: e.target.value }))
                    }
                    placeholder="e.g. Raipur, CG"
                  />
                </label>
                <label className="ow-label">
                  Your Name *
                  <input
                    className="ow-input"
                    value={form.ownerName}
                    onChange={e =>
                      setForm(p => ({ ...p, ownerName: e.target.value }))
                    }
                  />
                </label>
                <label className="ow-label">
                  Contact Number *
                  <input
                    className="ow-input"
                    value={form.contactNumber}
                    onChange={e =>
                      setForm(p => ({ ...p, contactNumber: e.target.value }))
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />
                </label>
                <label className="ow-label full">
                  Description
                  <textarea
                    className="ow-textarea"
                    value={form.description}
                    onChange={e =>
                      setForm(p => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Health status, vaccination info, what you're looking for..."
                  />
                </label>
              </div>
              {formError && <p className="ov-form-error">{formError}</p>}
              <div className="ov-modal-actions">
                <button
                  className="ow-btn ow-btn-secondary"
                  type="button"
                  onClick={() => setShowPostForm(false)}
                >
                  Cancel
                </button>
                <button className="ow-btn ow-btn-primary" type="submit">
                  <Send size={15} /> Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interest Modal */}
      {connectTarget && (
        <div
          className="ov-modal-overlay"
          onClick={() => setConnectTarget(null)}
        >
          <div
            className="ov-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '460px' }}
          >
            <div className="ov-modal-header">
              <h3>Show Interest — {connectTarget.petName}</h3>
              <button
                className="ov-modal-close"
                onClick={() => setConnectTarget(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <p
              style={{
                fontSize: '0.83rem',
                color: '#6b7280',
                margin: '0 0 14px',
              }}
            >
              Send a message to {connectTarget.ownerName} about connecting with{' '}
              {connectTarget.petName} ({connectTarget.breed}).
            </p>
            <form onSubmit={handleSendInterest}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <label className="ow-label">
                  My Pet's Name *
                  <input
                    className="ow-input"
                    value={connectForm.myPetName}
                    onChange={e =>
                      setConnectForm(p => ({ ...p, myPetName: e.target.value }))
                    }
                    placeholder="Your pet's name"
                  />
                </label>
                <label className="ow-label">
                  Message (optional)
                  <textarea
                    className="ow-textarea"
                    value={connectForm.message}
                    onChange={e =>
                      setConnectForm(p => ({ ...p, message: e.target.value }))
                    }
                    placeholder="Introduce your pet, share health info..."
                  />
                </label>
              </div>
              {connectError && <p className="ov-form-error">{connectError}</p>}
              <div className="ov-modal-actions">
                <button
                  className="ow-btn ow-btn-secondary"
                  type="button"
                  onClick={() => setConnectTarget(null)}
                >
                  Cancel
                </button>
                <button className="ow-btn ow-btn-primary" type="submit">
                  <Heart size={15} /> Send Interest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetConnect;
