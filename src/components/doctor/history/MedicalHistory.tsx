import { useMemo, useState } from 'react';
import {
  ClipboardList,
  Syringe,
  Search,
  FileText,
  Clock3,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatIstDate, getIstDateKey } from '../../../utils/istDateTime';
import { useStorageScope } from '../../../utils/StorageScope';
import './MedicalHistory.css';

type MedicineRow = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type PrescriptionHistoryRecord = {
  id: string;
  rxNo: string;
  createdAt: string;
  doctorName: string;
  animalName: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  height: string;
  ownerName: string;
  ownerContact: string;
  diagnosis: string;
  symptoms: string;
  duration: string;
  medicines: MedicineRow[];
  pathologyTests: string;
  precautions: string;
  nextVisit: string;
  prescriptionDate: string;
};

type VaccinationRecord = {
  id: string;
  certificateNo?: string;
  animalName: string;
  ownerName: string;
  ownerContact?: string;
  species: string;
  breed: string;
  age?: string;
  weight?: string;
  vaccineName: string;
  vaccineType?: string;
  doseNumber: string;
  routeOfAdmin: string;
  batchNumber?: string;
  manufacturer?: string;
  dateAdministered: string;
  nextDueDate: string;
  notes?: string;
};

type TimelineItem = {
  id: string;
  type: 'prescription' | 'vaccination';
  animalName: string;
  ownerName: string;
  species: string;
  date: string;
  title: string;
  subTitle: string;
  prescription?: PrescriptionHistoryRecord;
  vaccination?: VaccinationRecord;
};

const LS_PRESCRIPTIONS = 'vc_prescriptions';
const LS_VACCINATIONS = 'vc_vaccination_records';

const loadPrescriptions = (key: string): PrescriptionHistoryRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  } catch {
    return [];
  }
};

const loadVaccinations = (key: string): VaccinationRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  } catch {
    return [];
  }
};

const fmt = (date: string) => {
  if (!date) return '—';
  return formatIstDate(new Date(date + 'T00:00:00'), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const displayValue = (value?: string) => {
  if (!value) return '—';
  const trimmed = value.trim();
  return trimmed || '—';
};

const shiftDateKey = (dateKey: string, offset: number) => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return getIstDateKey(date);
};

function MedicalHistory() {
  const navigate = useNavigate();
  const storagePrefix = useStorageScope();
  const lsPrescriptions = storagePrefix + LS_PRESCRIPTIONS;
  const lsVaccinations = storagePrefix + LS_VACCINATIONS;
  const [searchParams] = useSearchParams();
  const [animalQuery, setAnimalQuery] = useState('');
  const [ownerQuery, setOwnerQuery] = useState('');
  const [mobileQuery, setMobileQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getIstDateKey());

  const prescriptions = useMemo(
    () => loadPrescriptions(lsPrescriptions),
    [lsPrescriptions],
  );
  const vaccinations = useMemo(
    () => loadVaccinations(lsVaccinations),
    [lsVaccinations],
  );
  const detailType = searchParams.get('type');
  const detailId = searchParams.get('id');
  const todayDateKey = getIstDateKey();
  const hasSearch =
    animalQuery.trim().length > 0 ||
    ownerQuery.trim().length > 0 ||
    mobileQuery.trim().length > 0;

  const filteredPrescriptions = useMemo(() => {
    const animal = animalQuery.trim().toLowerCase();
    const owner = ownerQuery.trim().toLowerCase();
    const mobile = mobileQuery.trim().toLowerCase();
    return prescriptions.filter(p => {
      if (hasSearch) {
        const animalOk =
          !animal || p.animalName.trim().toLowerCase().includes(animal);
        const ownerOk =
          !owner || p.ownerName.trim().toLowerCase().includes(owner);
        const mobileOk =
          !mobile || p.ownerContact.trim().toLowerCase().includes(mobile);
        return animalOk && ownerOk && mobileOk;
      }

      return (p.prescriptionDate || p.createdAt.slice(0, 10)) === selectedDate;
    });
  }, [
    animalQuery,
    hasSearch,
    mobileQuery,
    ownerQuery,
    prescriptions,
    selectedDate,
  ]);

  const filteredVaccinations = useMemo(() => {
    const animal = animalQuery.trim().toLowerCase();
    const owner = ownerQuery.trim().toLowerCase();
    const mobile = mobileQuery.trim().toLowerCase();
    return vaccinations.filter(v => {
      if (hasSearch) {
        const animalOk =
          !animal || v.animalName.trim().toLowerCase().includes(animal);
        const ownerOk =
          !owner || v.ownerName.trim().toLowerCase().includes(owner);
        const mobileOk =
          !mobile ||
          (v.ownerContact ?? '').trim().toLowerCase().includes(mobile);
        return animalOk && ownerOk && mobileOk;
      }

      return v.dateAdministered === selectedDate;
    });
  }, [
    animalQuery,
    hasSearch,
    mobileQuery,
    ownerQuery,
    selectedDate,
    vaccinations,
  ]);

  const sortedPrescriptions = useMemo(
    () =>
      [...filteredPrescriptions].sort((a, b) => {
        const aDate = a.prescriptionDate || a.createdAt.slice(0, 10);
        const bDate = b.prescriptionDate || b.createdAt.slice(0, 10);
        return bDate.localeCompare(aDate);
      }),
    [filteredPrescriptions],
  );

  const sortedVaccinations = useMemo(
    () =>
      [...filteredVaccinations].sort((a, b) =>
        b.dateAdministered.localeCompare(a.dateAdministered),
      ),
    [filteredVaccinations],
  );

  const activeFilters = [
    animalQuery.trim()
      ? { label: 'Animal name', value: animalQuery.trim() }
      : null,
    ownerQuery.trim()
      ? { label: 'Owner name', value: ownerQuery.trim() }
      : null,
    mobileQuery.trim()
      ? { label: 'Mobile number', value: mobileQuery.trim() }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const searchHeadingText = activeFilters
    .map(filter => `${filter.label} : ${filter.value}`)
    .join(' | ');

  const selectedEvent = useMemo<TimelineItem | null>(() => {
    if (!detailType || !detailId) {
      return null;
    }

    if (detailType === 'prescription') {
      const prescription = prescriptions.find(item => item.id === detailId);
      if (!prescription) {
        return null;
      }

      return {
        id: prescription.id,
        type: 'prescription',
        animalName: prescription.animalName,
        ownerName: prescription.ownerName,
        species: prescription.species,
        date:
          prescription.prescriptionDate || prescription.createdAt.slice(0, 10),
        title: prescription.diagnosis || 'Diagnosis not specified',
        subTitle: prescription.rxNo,
        prescription,
      };
    }

    if (detailType === 'vaccination') {
      const vaccination = vaccinations.find(item => item.id === detailId);
      if (!vaccination) {
        return null;
      }

      return {
        id: vaccination.id,
        type: 'vaccination',
        animalName: vaccination.animalName,
        ownerName: vaccination.ownerName,
        species: vaccination.species,
        date: vaccination.dateAdministered,
        title: vaccination.vaccineName,
        subTitle: vaccination.doseNumber || 'Dose not specified',
        vaccination,
      };
    }

    return null;
  }, [detailId, detailType, prescriptions, vaccinations]);

  const openEvent = (item: TimelineItem) => {
    navigate(`/doctor/dashboard/history?type=${item.type}&id=${item.id}`);
  };

  const applySearch = () => {
    setAnimalQuery(currentValue => currentValue.trim());
    setOwnerQuery(currentValue => currentValue.trim());
    setMobileQuery(currentValue => currentValue.trim());
  };

  const updateFilters = (
    nextAnimal: string,
    nextOwner: string,
    nextMobile: string,
  ) => {
    setAnimalQuery(nextAnimal);
    setOwnerQuery(nextOwner);
    setMobileQuery(nextMobile);

    if (
      nextAnimal.trim().length === 0 &&
      nextOwner.trim().length === 0 &&
      nextMobile.trim().length === 0
    ) {
      setSelectedDate(todayDateKey);
    }
  };

  const clearSearch = () => {
    updateFilters('', '', '');
  };

  const moveSelectedDate = (offset: number) => {
    setSelectedDate(currentDate => shiftDateKey(currentDate, offset));
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/doctor/dashboard/history');
  };

  if (selectedEvent) {
    return (
      <div className="history-page history-detail-page">
        <div className="history-detail-page-header">
          <div className="history-detail-page-toprow">
            <h1 className="dash-page-title">
              {selectedEvent.type === 'prescription'
                ? 'Prescription Details'
                : 'Vaccination Details'}
            </h1>
            <button
              type="button"
              className="history-back-btn"
              onClick={handleBack}
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <div className="history-detail-page-copy">
            <p className="history-detail-page-subtitle">
              Selected record details for {selectedEvent.animalName} (
              {selectedEvent.species || 'Unknown species'})
            </p>
            <div className="history-detail-page-meta">
              <span
                className={`history-detail-meta-chip ${selectedEvent.type}`}
              >
                {selectedEvent.type === 'prescription' ? (
                  <>
                    <ClipboardList size={13} /> Prescription
                  </>
                ) : (
                  <>
                    <Syringe size={13} /> Vaccination
                  </>
                )}
              </span>
              <span className="history-detail-meta-chip neutral">
                <Clock3 size={13} /> {fmt(selectedEvent.date)}
              </span>
              <span className="history-detail-meta-chip neutral">
                Ref: {displayValue(selectedEvent.subTitle)}
              </span>
            </div>
          </div>
        </div>

        <section className="dash-card history-detail-card">
          <section className="history-detail-section">
            <div className="history-detail-section-head">
              <h3>Visit Summary</h3>
              <p>Quick overview of this record</p>
            </div>
            <div className="history-detail-grid compact">
              <div>
                <span className="history-detail-label">Date</span>
                <p>{fmt(selectedEvent.date)}</p>
              </div>
              <div>
                <span className="history-detail-label">Record Type</span>
                <p>
                  {selectedEvent.type === 'prescription'
                    ? 'Prescription'
                    : 'Vaccination'}
                </p>
              </div>
              <div>
                <span className="history-detail-label">Reference</span>
                <p>{displayValue(selectedEvent.subTitle)}</p>
              </div>
            </div>
          </section>

          {selectedEvent.type === 'prescription' &&
            selectedEvent.prescription && (
              <>
                <section className="history-detail-section">
                  <div className="history-detail-section-head">
                    <h3>Animal Details</h3>
                    <p>Patient details captured at the time of prescription</p>
                  </div>
                  <div className="history-detail-grid compact">
                    <div>
                      <span className="history-detail-label">Animal Name</span>
                      <p>
                        {displayValue(selectedEvent.prescription.animalName)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Species</span>
                      <p>{displayValue(selectedEvent.prescription.species)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Rx Number</span>
                      <p>{displayValue(selectedEvent.prescription.rxNo)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Breed</span>
                      <p>{displayValue(selectedEvent.prescription.breed)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Age</span>
                      <p>{displayValue(selectedEvent.prescription.age)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Weight</span>
                      <p>{displayValue(selectedEvent.prescription.weight)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Height</span>
                      <p>{displayValue(selectedEvent.prescription.height)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Recorded On</span>
                      <p>{fmt(selectedEvent.date)}</p>
                    </div>
                  </div>
                </section>

                <section className="history-detail-section">
                  <div className="history-detail-section-head">
                    <h3>Owner Details</h3>
                    <p>Owner contact information for this visit</p>
                  </div>
                  <div className="history-detail-grid compact owner-grid">
                    <div>
                      <span className="history-detail-label">Owner Name</span>
                      <p>
                        {displayValue(selectedEvent.prescription.ownerName)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">
                        Contact Number
                      </span>
                      <p>
                        {displayValue(selectedEvent.prescription.ownerContact)}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="history-detail-section emphasis">
                  <div className="history-detail-section-head">
                    <h3>Clinical Assessment</h3>
                    <p>Diagnosis, observed symptoms, and care plan</p>
                  </div>
                  <div className="history-detail-grid feature">
                    <div className="history-feature-card primary">
                      <span className="history-detail-label">Diagnosis</span>
                      <p>
                        {displayValue(selectedEvent.prescription.diagnosis)}
                      </p>
                    </div>
                    <div className="history-feature-card wide">
                      <span className="history-detail-label">Symptoms</span>
                      <p>{displayValue(selectedEvent.prescription.symptoms)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Duration</span>
                      <p>{displayValue(selectedEvent.prescription.duration)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Pathology</span>
                      <p>
                        {displayValue(
                          selectedEvent.prescription.pathologyTests,
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Precautions</span>
                      <p>
                        {displayValue(selectedEvent.prescription.precautions)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Next Visit</span>
                      <p>
                        {selectedEvent.prescription.nextVisit
                          ? fmt(selectedEvent.prescription.nextVisit)
                          : '—'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="history-detail-section history-detail-block">
                  <h4>Medicines</h4>
                  {selectedEvent.prescription.medicines?.filter(m =>
                    m.name.trim(),
                  ).length ? (
                    <div className="history-medicine-cards">
                      {selectedEvent.prescription.medicines
                        .filter(m => m.name.trim())
                        .map(m => (
                          <article key={m.id} className="history-medicine-card">
                            <div className="history-medicine-head">
                              <strong>{m.name}</strong>
                            </div>
                            <div className="history-medicine-grid">
                              <div>
                                <span className="history-medicine-label">
                                  Dosage
                                </span>
                                <span>{displayValue(m.dosage)}</span>
                              </div>
                              <div>
                                <span className="history-medicine-label">
                                  Frequency
                                </span>
                                <span>{displayValue(m.frequency)}</span>
                              </div>
                              <div>
                                <span className="history-medicine-label">
                                  Duration
                                </span>
                                <span>{displayValue(m.duration)}</span>
                              </div>
                            </div>
                            <div className="history-medicine-instructions">
                              <span className="history-medicine-label">
                                Instructions
                              </span>
                              <p>{displayValue(m.instructions)}</p>
                            </div>
                          </article>
                        ))}
                    </div>
                  ) : (
                    <p className="history-detail-empty">
                      No medicines recorded.
                    </p>
                  )}
                </section>
              </>
            )}

          {selectedEvent.type === 'vaccination' &&
            selectedEvent.vaccination && (
              <>
                <section className="history-detail-section">
                  <div className="history-detail-section-head">
                    <h3>Animal Details</h3>
                    <p>Patient details captured at the time of vaccination</p>
                  </div>
                  <div className="history-detail-grid compact">
                    <div>
                      <span className="history-detail-label">Animal Name</span>
                      <p>
                        {displayValue(selectedEvent.vaccination.animalName)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Species</span>
                      <p>{displayValue(selectedEvent.vaccination.species)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Breed</span>
                      <p>{displayValue(selectedEvent.vaccination.breed)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Age</span>
                      <p>{displayValue(selectedEvent.vaccination.age)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Weight</span>
                      <p>{displayValue(selectedEvent.vaccination.weight)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">
                        Date Administered
                      </span>
                      <p>{fmt(selectedEvent.vaccination.dateAdministered)}</p>
                    </div>
                  </div>
                </section>

                <section className="history-detail-section">
                  <div className="history-detail-section-head">
                    <h3>Owner Details</h3>
                    <p>Owner contact information for this vaccination</p>
                  </div>
                  <div className="history-detail-grid compact owner-grid">
                    <div>
                      <span className="history-detail-label">Owner Name</span>
                      <p>{displayValue(selectedEvent.vaccination.ownerName)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">
                        Contact Number
                      </span>
                      <p>
                        {displayValue(selectedEvent.vaccination.ownerContact)}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="history-detail-section emphasis">
                  <div className="history-detail-section-head">
                    <h3>Vaccination Summary</h3>
                    <p>Dose, schedule, and administration details</p>
                  </div>
                  <div className="history-detail-grid feature">
                    <div className="history-feature-card primary">
                      <span className="history-detail-label">Vaccine</span>
                      <p>
                        {displayValue(selectedEvent.vaccination.vaccineName)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">
                        Certificate No
                      </span>
                      <p>
                        {displayValue(selectedEvent.vaccination.certificateNo)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Vaccine Type</span>
                      <p>
                        {displayValue(selectedEvent.vaccination.vaccineType)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Dose</span>
                      <p>
                        {displayValue(selectedEvent.vaccination.doseNumber)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Route</span>
                      <p>
                        {displayValue(selectedEvent.vaccination.routeOfAdmin)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">
                        Next Due Date
                      </span>
                      <p>{fmt(selectedEvent.vaccination.nextDueDate)}</p>
                    </div>
                    <div>
                      <span className="history-detail-label">Batch Number</span>
                      <p>
                        {displayValue(selectedEvent.vaccination.batchNumber)}
                      </p>
                    </div>
                    <div>
                      <span className="history-detail-label">Manufacturer</span>
                      <p>
                        {displayValue(selectedEvent.vaccination.manufacturer)}
                      </p>
                    </div>
                    <div className="history-feature-card wide">
                      <span className="history-detail-label">Notes</span>
                      <p>{displayValue(selectedEvent.vaccination.notes)}</p>
                    </div>
                  </div>
                </section>
              </>
            )}
        </section>
      </div>
    );
  }

  return (
    <div className="history-page">
      <h1 className="dash-page-title">
        <FileText size={22} /> Medical History
      </h1>

      <section className="dash-card history-toolbar-card">
        <div className="history-toolbar-head">
          <div>
            <h2 className="history-section-title">Find Medical Records</h2>
            <p className="history-toolbar-subtitle">
              Search by pet, owner, or mobile to quickly find matching medical
              records.
            </p>
          </div>
        </div>

        <div className="history-search-row">
          <div className="history-input-wrap history-search-field">
            <Search size={14} />
            <input
              value={animalQuery}
              onChange={e =>
                updateFilters(e.target.value, ownerQuery, mobileQuery)
              }
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  applySearch();
                }
              }}
              placeholder="Animal Name"
              aria-label="Search by animal name"
            />
          </div>
          <div className="history-input-wrap history-search-field">
            <Search size={14} />
            <input
              value={ownerQuery}
              onChange={e =>
                updateFilters(animalQuery, e.target.value, mobileQuery)
              }
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  applySearch();
                }
              }}
              placeholder="Owner Name"
              aria-label="Search by owner name"
            />
          </div>
          <div className="history-input-wrap history-search-field">
            <Search size={14} />
            <input
              value={mobileQuery}
              onChange={e =>
                updateFilters(animalQuery, ownerQuery, e.target.value)
              }
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  applySearch();
                }
              }}
              placeholder="Mobile Number"
              aria-label="Search by mobile number"
            />
          </div>
          <button
            type="button"
            className="history-search-btn"
            onClick={applySearch}
            disabled={!hasSearch}
          >
            <Search size={14} /> Search
          </button>
          <button
            type="button"
            className="history-clear-btn history-clear-inline-btn"
            onClick={clearSearch}
            disabled={!hasSearch}
          >
            <X size={14} /> Clear
          </button>
        </div>
      </section>

      <section className="dash-card history-records-card">
        <div className="history-records-head">
          <div>
            <h2 className="history-section-title">
              {hasSearch
                ? `Medical Records For ${searchHeadingText}`
                : `Medical Records For ${fmt(selectedDate)}`}
            </h2>
            <p className="history-date-subtitle">
              {hasSearch
                ? 'Showing all diagnosis and vaccination records for the matching pet filters.'
                : 'Open any record card to view the full medical details.'}
            </p>
          </div>
          {!hasSearch && (
            <div className="history-records-side">
              <div className="history-date-picker-wrap">
                <span className="history-date-picker-icon-label">
                  <CalendarDays size={14} /> Browse by date
                </span>
                <div className="history-date-nav">
                  <button
                    type="button"
                    className="history-date-nav-btn"
                    onClick={() => moveSelectedDate(-1)}
                    aria-label="Previous date"
                    title="Previous date"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="history-date-input-shell">
                    <input
                      className="history-date-input"
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="history-date-nav-btn"
                    onClick={() => moveSelectedDate(1)}
                    aria-label="Next date"
                    title="Next date"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="history-date-today-btn"
                    onClick={() => setSelectedDate(todayDateKey)}
                    disabled={selectedDate === todayDateKey}
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="history-records-columns">
          <section className="history-records-column">
            <div className="history-column-head">
              <h3>
                <ClipboardList size={16} /> Diagnosis
              </h3>
              <span className="history-column-pill">
                {sortedPrescriptions.length}
              </span>
            </div>

            {sortedPrescriptions.length === 0 ? (
              <p className="history-empty">
                {hasSearch
                  ? 'No diagnosis records found for this search.'
                  : 'No diagnosis records found on the selected date.'}
              </p>
            ) : (
              <div className="history-timeline-list history-record-list">
                {sortedPrescriptions.map(item => {
                  const date =
                    item.prescriptionDate || item.createdAt.slice(0, 10);
                  return (
                    <div
                      key={item.id}
                      className="history-timeline-row"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        openEvent({
                          id: item.id,
                          type: 'prescription',
                          animalName: item.animalName,
                          ownerName: item.ownerName,
                          species: item.species,
                          date,
                          title: item.diagnosis || 'Diagnosis not specified',
                          subTitle: item.rxNo,
                          prescription: item,
                        })
                      }
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openEvent({
                            id: item.id,
                            type: 'prescription',
                            animalName: item.animalName,
                            ownerName: item.ownerName,
                            species: item.species,
                            date,
                            title: item.diagnosis || 'Diagnosis not specified',
                            subTitle: item.rxNo,
                            prescription: item,
                          });
                        }
                      }}
                    >
                      <div className="history-type-badge prescription">
                        <ClipboardList size={12} /> Rx
                      </div>
                      <div className="history-main">
                        <p className="history-main-title">
                          {item.diagnosis || 'Diagnosis not specified'}
                        </p>
                        <p className="history-main-meta">
                          {item.animalName} ({item.species || 'Unknown species'}
                          ) · {item.ownerName} ·{' '}
                          {item.ownerContact || 'No contact'}
                        </p>
                      </div>
                      <div className="history-right">
                        <span className="history-subtitle">{item.rxNo}</span>
                        <span className="history-date">
                          <Clock3 size={12} /> {fmt(date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="history-records-column">
            <div className="history-column-head">
              <h3>
                <Syringe size={16} /> Vaccinations
              </h3>
              <span className="history-column-pill vaccination">
                {sortedVaccinations.length}
              </span>
            </div>

            {sortedVaccinations.length === 0 ? (
              <p className="history-empty">
                {hasSearch
                  ? 'No vaccination records found for this search.'
                  : 'No vaccination records found on the selected date.'}
              </p>
            ) : (
              <div className="history-timeline-list history-record-list">
                {sortedVaccinations.map(item => (
                  <div
                    key={item.id}
                    className="history-timeline-row"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      openEvent({
                        id: item.id,
                        type: 'vaccination',
                        animalName: item.animalName,
                        ownerName: item.ownerName,
                        species: item.species,
                        date: item.dateAdministered,
                        title: item.vaccineName,
                        subTitle: item.doseNumber || 'Dose not specified',
                        vaccination: item,
                      })
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openEvent({
                          id: item.id,
                          type: 'vaccination',
                          animalName: item.animalName,
                          ownerName: item.ownerName,
                          species: item.species,
                          date: item.dateAdministered,
                          title: item.vaccineName,
                          subTitle: item.doseNumber || 'Dose not specified',
                          vaccination: item,
                        });
                      }
                    }}
                  >
                    <div className="history-type-badge vaccination">
                      <Syringe size={12} />
                    </div>
                    <div className="history-main">
                      <p className="history-main-title">{item.vaccineName}</p>
                      <p className="history-main-meta">
                        {item.animalName} ({item.species || 'Unknown species'})
                        · {item.ownerName} · {item.ownerContact || 'No contact'}
                      </p>
                    </div>
                    <div className="history-right">
                      <span className="history-subtitle">
                        {item.doseNumber || 'Dose not specified'}
                      </span>
                      <span className="history-date">
                        <Clock3 size={12} /> {fmt(item.dateAdministered)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

export default MedicalHistory;
