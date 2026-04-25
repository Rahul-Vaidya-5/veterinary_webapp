import { useMemo, useState } from 'react';
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  RefreshCcw,
  XCircle,
  IndianRupee,
  Syringe,
  Users,
  UmbrellaOff,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { getIstDateKey } from '../../../utils/istDateTime';
import './DoctorOverview.css';

type Appointment = {
  id: string;
  slot?: 'morning' | 'noon' | 'evening';
  patientName: string;
  species?: string;
  breed?: string;
  age?: string;
  ownerName?: string;
  ownerContact?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | string;
  cancellationNote?: string;
};

type AppointmentStore = Record<string, Appointment[]>;

type MoneyEntry = {
  id: string;
  date: string;
  amount: number;
  source?: string;
  category?: string;
};

type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';
type AttendanceStore = Record<string, Record<string, AttendanceStatus>>;
type HolidaysStore = Record<
  string,
  { morning: boolean; noon: boolean; evening: boolean }
>;
type VaccineEntry = { id: string; quantity: number; expiryDate?: string };

const LS_APPOINTMENTS = 'vc_appointments';
const LS_INCOME = 'vc_income';
const LS_EXPENSES = 'vc_expenses';
const LS_ATTENDANCE = 'vc_attendance';
const LS_HOLIDAYS = 'vc_holidays';
const LS_VACCINATIONS = 'vc_vaccinations';
const LS_EMPLOYEES = 'vc_employees';

const INCOME_PIE_COLORS = [
  '#60a5fa',
  '#38bdf8',
  '#22d3ee',
  '#2dd4bf',
  '#34d399',
  '#6ee7b7',
  '#a7f3d0',
];

const EXPENSE_PIE_COLORS = [
  '#fb7185',
  '#fda4af',
  '#fdba74',
  '#fcd34d',
  '#fde68a',
  '#f9a8d4',
  '#fecdd3',
];

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const getMonthKey = (dateStr: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  return dateStr.slice(0, 7);
};

const monthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, (month || 1) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const getMonthSequence = (endMonthKey: string, count: number): string[] => {
  const [year, month] = endMonthKey.split('-').map(Number);
  const d = new Date(year, (month || 1) - 1, 1);
  const months: string[] = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const y = x.getFullYear();
    const m = `${x.getMonth() + 1}`.padStart(2, '0');
    months.push(`${y}-${m}`);
  }

  return months;
};

const toPatientKey = (appt: Appointment) => {
  const pet = (appt.patientName || '').trim().toLowerCase();
  const ownerContact = (appt.ownerContact || '').trim();
  const ownerName = (appt.ownerName || '').trim().toLowerCase();
  return `${pet}|${ownerContact || ownerName}`;
};

const hasUsableData = (raw: string | null) => {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.length > 0;
    if (typeof parsed === 'object' && parsed !== null)
      return Object.keys(parsed).length > 0;
    return false;
  } catch {
    return false;
  }
};

const buildDummyClinicData = (currentMonth: string) => {
  const months = getMonthSequence(currentMonth, 6);
  const [m1, m2, m3, m4, m5, m6] = months;

  const appointments: AppointmentStore = {
    [`${m1}-04`]: [
      {
        id: 'apt-m1-1',
        slot: 'morning',
        patientName: 'Bruno',
        species: 'Dog',
        ownerName: 'Aman',
        ownerContact: '9876543210',
        status: 'completed',
      },
      {
        id: 'apt-m1-2',
        slot: 'evening',
        patientName: 'Milo',
        species: 'Cat',
        ownerName: 'Ria',
        ownerContact: '9860012200',
        status: 'cancelled',
      },
    ],
    [`${m2}-08`]: [
      {
        id: 'apt-m2-1',
        slot: 'morning',
        patientName: 'Tommy',
        species: 'Dog',
        ownerName: 'Kiran',
        ownerContact: '9900112233',
        status: 'completed',
      },
      {
        id: 'apt-m2-2',
        slot: 'noon',
        patientName: 'Luna',
        species: 'Cat',
        ownerName: 'Neha',
        ownerContact: '9812345678',
        status: 'scheduled',
      },
      {
        id: 'apt-m2-3',
        slot: 'evening',
        patientName: 'Milo',
        species: 'Cat',
        ownerName: 'Ria',
        ownerContact: '9860012200',
        status: 'completed',
      },
    ],
    [`${m3}-12`]: [
      {
        id: 'apt-m3-1',
        slot: 'morning',
        patientName: 'Rocky',
        species: 'Dog',
        ownerName: 'Faiz',
        ownerContact: '9822213344',
        status: 'completed',
      },
      {
        id: 'apt-m3-2',
        slot: 'evening',
        patientName: 'Bunny',
        species: 'Rabbit',
        ownerName: 'Sana',
        ownerContact: '9811188899',
        status: 'rescheduled',
      },
    ],
    [`${m4}-07`]: [
      {
        id: 'apt-m4-1',
        slot: 'morning',
        patientName: 'Bruno',
        species: 'Dog',
        ownerName: 'Aman',
        ownerContact: '9876543210',
        status: 'completed',
      },
      {
        id: 'apt-m4-2',
        slot: 'noon',
        patientName: 'Coco',
        species: 'Dog',
        ownerName: 'Priya',
        ownerContact: '9899912121',
        status: 'scheduled',
      },
      {
        id: 'apt-m4-3',
        slot: 'evening',
        patientName: 'Simba',
        species: 'Cat',
        ownerName: 'Raj',
        ownerContact: '9844455566',
        status: 'cancelled',
        cancellationNote: 'Owner travelling',
      },
    ],
    [`${m5}-15`]: [
      {
        id: 'apt-m5-1',
        slot: 'morning',
        patientName: 'Milo',
        species: 'Cat',
        ownerName: 'Ria',
        ownerContact: '9860012200',
        status: 'completed',
      },
      {
        id: 'apt-m5-2',
        slot: 'noon',
        patientName: 'Rocky',
        species: 'Dog',
        ownerName: 'Faiz',
        ownerContact: '9822213344',
        status: 'scheduled',
      },
      {
        id: 'apt-m5-3',
        slot: 'evening',
        patientName: 'Bunny',
        species: 'Rabbit',
        ownerName: 'Sana',
        ownerContact: '9811188899',
        status: 'cancelled',
      },
    ],
    [`${m6}-03`]: [
      {
        id: 'apt-m6-1',
        slot: 'morning',
        patientName: 'Bruno',
        species: 'Dog',
        ownerName: 'Aman',
        ownerContact: '9876543210',
        status: 'completed',
      },
      {
        id: 'apt-m6-2',
        slot: 'morning',
        patientName: 'Simba',
        species: 'Cat',
        ownerName: 'Raj',
        ownerContact: '9844455566',
        status: 'scheduled',
      },
      {
        id: 'apt-m6-3',
        slot: 'noon',
        patientName: 'Coco',
        species: 'Dog',
        ownerName: 'Priya',
        ownerContact: '9899912121',
        status: 'completed',
      },
      {
        id: 'apt-m6-4',
        slot: 'evening',
        patientName: 'Bunny',
        species: 'Rabbit',
        ownerName: 'Sana',
        ownerContact: '9811188899',
        status: 'rescheduled',
      },
      {
        id: 'apt-m6-5',
        slot: 'evening',
        patientName: 'Tommy',
        species: 'Dog',
        ownerName: 'Kiran',
        ownerContact: '9900112233',
        status: 'cancelled',
      },
    ],
    [`${m6}-09`]: [
      {
        id: 'apt-m6-6',
        slot: 'morning',
        patientName: 'Luna',
        species: 'Cat',
        ownerName: 'Neha',
        ownerContact: '9812345678',
        status: 'scheduled',
      },
      {
        id: 'apt-m6-7',
        slot: 'noon',
        patientName: 'Milo',
        species: 'Cat',
        ownerName: 'Ria',
        ownerContact: '9860012200',
        status: 'completed',
      },
      {
        id: 'apt-m6-8',
        slot: 'evening',
        patientName: 'Rocky',
        species: 'Dog',
        ownerName: 'Faiz',
        ownerContact: '9822213344',
        status: 'scheduled',
      },
    ],
    [`${m6}-18`]: [
      {
        id: 'apt-m6-9',
        slot: 'morning',
        patientName: 'Simba',
        species: 'Cat',
        ownerName: 'Raj',
        ownerContact: '9844455566',
        status: 'completed',
      },
      {
        id: 'apt-m6-10',
        slot: 'noon',
        patientName: 'Tommy',
        species: 'Dog',
        ownerName: 'Kiran',
        ownerContact: '9900112233',
        status: 'scheduled',
      },
      {
        id: 'apt-m6-11',
        slot: 'evening',
        patientName: 'Bella',
        species: 'Dog',
        ownerName: 'Anu',
        ownerContact: '9833344455',
        status: 'cancelled',
      },
    ],
  };

  const income: MoneyEntry[] = [
    {
      id: `inc-${m1}-1`,
      date: `${m1}-05`,
      source: 'Consultation',
      amount: 18000,
    },
    {
      id: `inc-${m1}-2`,
      date: `${m1}-17`,
      source: 'Vaccination',
      amount: 6500,
    },
    { id: `inc-${m1}-3`, date: `${m1}-24`, source: 'Procedure', amount: 11000 },
    {
      id: `inc-${m2}-1`,
      date: `${m2}-04`,
      source: 'Consultation',
      amount: 21000,
    },
    { id: `inc-${m2}-2`, date: `${m2}-12`, source: 'Surgery', amount: 32000 },
    {
      id: `inc-${m2}-3`,
      date: `${m2}-22`,
      source: 'Vaccination',
      amount: 7200,
    },
    {
      id: `inc-${m3}-1`,
      date: `${m3}-07`,
      source: 'Consultation',
      amount: 25000,
    },
    { id: `inc-${m3}-2`, date: `${m3}-20`, source: 'Procedure', amount: 14500 },
    {
      id: `inc-${m3}-3`,
      date: `${m3}-26`,
      source: 'Vaccination',
      amount: 9100,
    },
    {
      id: `inc-${m4}-1`,
      date: `${m4}-06`,
      source: 'Consultation',
      amount: 23200,
    },
    { id: `inc-${m4}-2`, date: `${m4}-14`, source: 'Surgery', amount: 28800 },
    { id: `inc-${m4}-3`, date: `${m4}-23`, source: 'Grooming', amount: 5600 },
    {
      id: `inc-${m5}-1`,
      date: `${m5}-03`,
      source: 'Consultation',
      amount: 26800,
    },
    { id: `inc-${m5}-2`, date: `${m5}-15`, source: 'Procedure', amount: 13800 },
    {
      id: `inc-${m5}-3`,
      date: `${m5}-27`,
      source: 'Vaccination',
      amount: 9800,
    },
    {
      id: `inc-${m6}-1`,
      date: `${m6}-02`,
      source: 'Consultation',
      amount: 27400,
    },
    {
      id: `inc-${m6}-2`,
      date: `${m6}-09`,
      source: 'Vaccination',
      amount: 11200,
    },
    { id: `inc-${m6}-3`, date: `${m6}-18`, source: 'Surgery', amount: 35400 },
  ];

  const expenses: MoneyEntry[] = [
    {
      id: `exp-${m1}-1`,
      date: `${m1}-03`,
      category: 'Medicines',
      amount: 8200,
    },
    { id: `exp-${m1}-2`, date: `${m1}-10`, category: 'Rent', amount: 18000 },
    {
      id: `exp-${m1}-3`,
      date: `${m1}-21`,
      category: 'Utilities',
      amount: 3600,
    },
    { id: `exp-${m2}-1`, date: `${m2}-05`, category: 'Salary', amount: 28000 },
    {
      id: `exp-${m2}-2`,
      date: `${m2}-17`,
      category: 'Equipment',
      amount: 12600,
    },
    {
      id: `exp-${m2}-3`,
      date: `${m2}-25`,
      category: 'Maintenance',
      amount: 4100,
    },
    {
      id: `exp-${m3}-1`,
      date: `${m3}-06`,
      category: 'Medicines',
      amount: 9400,
    },
    { id: `exp-${m3}-2`, date: `${m3}-13`, category: 'Salary', amount: 29500 },
    {
      id: `exp-${m3}-3`,
      date: `${m3}-24`,
      category: 'Transportation',
      amount: 3300,
    },
    { id: `exp-${m4}-1`, date: `${m4}-04`, category: 'Rent', amount: 18000 },
    {
      id: `exp-${m4}-2`,
      date: `${m4}-16`,
      category: 'Utilities',
      amount: 3900,
    },
    {
      id: `exp-${m4}-3`,
      date: `${m4}-22`,
      category: 'Equipment',
      amount: 9800,
    },
    { id: `exp-${m5}-1`, date: `${m5}-05`, category: 'Salary', amount: 30200 },
    {
      id: `exp-${m5}-2`,
      date: `${m5}-18`,
      category: 'Medicines',
      amount: 10700,
    },
    {
      id: `exp-${m5}-3`,
      date: `${m5}-26`,
      category: 'Maintenance',
      amount: 4500,
    },
    { id: `exp-${m6}-1`, date: `${m6}-04`, category: 'Rent', amount: 18000 },
    { id: `exp-${m6}-2`, date: `${m6}-11`, category: 'Salary', amount: 31500 },
    {
      id: `exp-${m6}-3`,
      date: `${m6}-20`,
      category: 'Medicines',
      amount: 12300,
    },
  ];

  const employees = [
    { id: 'emp-1', name: 'Karthik', role: 'Vet Assistant' },
    { id: 'emp-2', name: 'Shreya', role: 'Nurse' },
    { id: 'emp-3', name: 'Madan', role: 'Reception' },
    { id: 'emp-4', name: 'Pooja', role: 'Helper' },
  ];

  const attendance: AttendanceStore = {
    [`${m6}-01`]: {
      'emp-1': 'present',
      'emp-2': 'present',
      'emp-3': 'half-day',
      'emp-4': 'present',
    },
    [`${m6}-02`]: {
      'emp-1': 'present',
      'emp-2': 'present',
      'emp-3': 'present',
      'emp-4': 'absent',
    },
    [`${m6}-03`]: {
      'emp-1': 'leave',
      'emp-2': 'present',
      'emp-3': 'present',
      'emp-4': 'present',
    },
    [`${m6}-05`]: {
      'emp-1': 'present',
      'emp-2': 'half-day',
      'emp-3': 'present',
      'emp-4': 'present',
    },
    [`${m6}-06`]: {
      'emp-1': 'present',
      'emp-2': 'present',
      'emp-3': 'absent',
      'emp-4': 'present',
    },
    [`${m6}-08`]: {
      'emp-1': 'present',
      'emp-2': 'present',
      'emp-3': 'present',
      'emp-4': 'present',
    },
    [`${m5}-14`]: {
      'emp-1': 'present',
      'emp-2': 'leave',
      'emp-3': 'present',
      'emp-4': 'half-day',
    },
  };

  const holidays: HolidaysStore = {
    [`${m6}-10`]: { morning: true, noon: false, evening: true },
    [`${m6}-22`]: { morning: true, noon: true, evening: true },
    [`${m5}-19`]: { morning: false, noon: true, evening: true },
  };

  const vaccines = [
    {
      id: 'vacc-1',
      name: 'Rabies Vaccine',
      brand: 'Caniguard',
      batchNumber: 'RBX-210',
      quantity: 40,
      expiryDate: `${m6}-28`,
      animalType: 'Dog',
      manufacturer: 'BioPet',
      costPerDose: 250,
      notes: 'Annual dose',
    },
    {
      id: 'vacc-2',
      name: 'DHPPi',
      brand: 'Nobivac',
      batchNumber: 'DHP-882',
      quantity: 22,
      expiryDate: `${m6}-19`,
      animalType: 'Dog',
      manufacturer: 'MSD',
      costPerDose: 320,
      notes: 'Puppy booster',
    },
    {
      id: 'vacc-3',
      name: 'FVRCP',
      brand: 'Felocell',
      batchNumber: 'CAT-144',
      quantity: 18,
      expiryDate: `${m5}-30`,
      animalType: 'Cat',
      manufacturer: 'Zoetis',
      costPerDose: 280,
      notes: 'Core vaccine',
    },
  ];

  return {
    appointments,
    income,
    expenses,
    attendance,
    holidays,
    vaccines,
    employees,
  };
};

const seedDummyDataIfNeeded = () => {
  const shouldSeed = [
    LS_APPOINTMENTS,
    LS_INCOME,
    LS_EXPENSES,
    LS_ATTENDANCE,
    LS_HOLIDAYS,
    LS_VACCINATIONS,
    LS_EMPLOYEES,
  ].some(key => !hasUsableData(localStorage.getItem(key)));

  if (!shouldSeed) return;

  const currentMonth = getIstDateKey().slice(0, 7);
  const demo = buildDummyClinicData(currentMonth);

  if (!hasUsableData(localStorage.getItem(LS_APPOINTMENTS))) {
    localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(demo.appointments));
  }
  if (!hasUsableData(localStorage.getItem(LS_INCOME))) {
    localStorage.setItem(LS_INCOME, JSON.stringify(demo.income));
  }
  if (!hasUsableData(localStorage.getItem(LS_EXPENSES))) {
    localStorage.setItem(LS_EXPENSES, JSON.stringify(demo.expenses));
  }
  if (!hasUsableData(localStorage.getItem(LS_ATTENDANCE))) {
    localStorage.setItem(LS_ATTENDANCE, JSON.stringify(demo.attendance));
  }
  if (!hasUsableData(localStorage.getItem(LS_HOLIDAYS))) {
    localStorage.setItem(LS_HOLIDAYS, JSON.stringify(demo.holidays));
  }
  if (!hasUsableData(localStorage.getItem(LS_VACCINATIONS))) {
    localStorage.setItem(LS_VACCINATIONS, JSON.stringify(demo.vaccines));
  }
  if (!hasUsableData(localStorage.getItem(LS_EMPLOYEES))) {
    localStorage.setItem(LS_EMPLOYEES, JSON.stringify(demo.employees));
  }
};

const asNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

function DoctorOverview() {
  const currentMonth = getIstDateKey().slice(0, 7);

  useMemo(() => {
    seedDummyDataIfNeeded();
  }, []);

  const appointmentsStore = useMemo(
    () =>
      safeParse<AppointmentStore>(localStorage.getItem(LS_APPOINTMENTS), {}),
    [],
  );
  const income = useMemo(
    () => safeParse<MoneyEntry[]>(localStorage.getItem(LS_INCOME), []),
    [],
  );
  const expenses = useMemo(
    () => safeParse<MoneyEntry[]>(localStorage.getItem(LS_EXPENSES), []),
    [],
  );
  const attendance = useMemo(
    () => safeParse<AttendanceStore>(localStorage.getItem(LS_ATTENDANCE), {}),
    [],
  );
  const holidays = useMemo(
    () => safeParse<HolidaysStore>(localStorage.getItem(LS_HOLIDAYS), {}),
    [],
  );
  const vaccines = useMemo(
    () => safeParse<VaccineEntry[]>(localStorage.getItem(LS_VACCINATIONS), []),
    [],
  );
  const employees = useMemo(
    () =>
      safeParse<Array<{ id: string }>>(localStorage.getItem(LS_EMPLOYEES), []),
    [],
  );

  const allMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    keys.add(currentMonth);

    Object.keys(appointmentsStore).forEach(dateStr => {
      const m = getMonthKey(dateStr);
      if (m) keys.add(m);
    });
    income.forEach(entry => {
      const m = getMonthKey(entry.date);
      if (m) keys.add(m);
    });
    expenses.forEach(entry => {
      const m = getMonthKey(entry.date);
      if (m) keys.add(m);
    });
    Object.keys(attendance).forEach(dateStr => {
      const m = getMonthKey(dateStr);
      if (m) keys.add(m);
    });
    Object.keys(holidays).forEach(dateStr => {
      const m = getMonthKey(dateStr);
      if (m) keys.add(m);
    });

    return [...keys].sort().reverse();
  }, [appointmentsStore, income, expenses, attendance, holidays, currentMonth]);

  const [selectedMonth, setSelectedMonth] = useState(
    allMonthKeys[0] ?? currentMonth,
  );

  const monthAppointments = useMemo(
    () =>
      Object.entries(appointmentsStore)
        .filter(([dateStr]) => dateStr.startsWith(selectedMonth))
        .flatMap(([dateStr, list]) =>
          list.map(item => ({
            ...item,
            dateStr,
          })),
        ),
    [appointmentsStore, selectedMonth],
  );

  const patientHistory = useMemo(() => {
    const map = new Map<string, string[]>();
    Object.entries(appointmentsStore).forEach(([dateStr, list]) => {
      list.forEach(appt => {
        const key = toPatientKey(appt);
        if (!key || key === '|') return;
        const bucket = map.get(key) ?? [];
        bucket.push(dateStr);
        map.set(key, bucket);
      });
    });

    map.forEach((dates, key) => {
      map.set(key, [...dates].sort());
    });

    return map;
  }, [appointmentsStore]);

  const appointmentStats = useMemo(() => {
    const scheduled = monthAppointments.filter(
      a => a.status === 'scheduled',
    ).length;
    const completed = monthAppointments.filter(
      a => a.status === 'completed',
    ).length;
    const cancelled = monthAppointments.filter(
      a => a.status === 'cancelled',
    ).length;
    const explicitRescheduled = monthAppointments.filter(
      a => a.status === 'rescheduled',
    ).length;

    const inferredRescheduled = monthAppointments.filter(a => {
      if (a.status !== 'cancelled') return false;
      const key = toPatientKey(a);
      const visits = patientHistory.get(key) ?? [];
      return visits.some(d => d > a.dateStr);
    }).length;

    const followUpPatients = new Set<string>();
    monthAppointments.forEach(appt => {
      const key = toPatientKey(appt);
      const visits = patientHistory.get(key) ?? [];
      if (visits.some(d => d < appt.dateStr)) {
        followUpPatients.add(key);
      }
    });

    return {
      scheduled,
      completed,
      cancelled,
      rescheduled: explicitRescheduled + inferredRescheduled,
      followUpCount: followUpPatients.size,
    };
  }, [monthAppointments, patientHistory]);

  const monthIncome = useMemo(
    () => income.filter(entry => entry.date.startsWith(selectedMonth)),
    [income, selectedMonth],
  );

  const monthExpenses = useMemo(
    () => expenses.filter(entry => entry.date.startsWith(selectedMonth)),
    [expenses, selectedMonth],
  );

  const totalIncome = monthIncome.reduce(
    (sum, entry) => sum + (entry.amount || 0),
    0,
  );
  const totalExpenses = monthExpenses.reduce(
    (sum, entry) => sum + (entry.amount || 0),
    0,
  );

  const incomeBySource = useMemo(() => {
    const grouped: Record<string, number> = {};
    monthIncome.forEach(entry => {
      const key = entry.source || 'Other';
      grouped[key] = (grouped[key] ?? 0) + (entry.amount || 0);
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthIncome]);

  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    monthExpenses.forEach(entry => {
      const key = entry.category || 'Other';
      grouped[key] = (grouped[key] ?? 0) + (entry.amount || 0);
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  const vaccinationStats = useMemo(() => {
    const vaccinationIncome = monthIncome.filter(
      entry => entry.source === 'Vaccination',
    );
    const vaccinationVisits = vaccinationIncome.length;
    const vaccinationRevenue = vaccinationIncome.reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0,
    );

    const todayTs = Date.now();
    const expiringSoon = vaccines.filter(entry => {
      if (!entry.expiryDate) return false;
      const expiryTs = new Date(entry.expiryDate).getTime();
      const diffDays = (expiryTs - todayTs) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    const availableDoses = vaccines.reduce(
      (sum, entry) => sum + Math.max(0, Number(entry.quantity || 0)),
      0,
    );

    return {
      vaccinationVisits,
      vaccinationRevenue,
      availableDoses,
      expiringSoon,
    };
  }, [monthIncome, vaccines]);

  const attendanceStats = useMemo(() => {
    const totals: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      'half-day': 0,
      leave: 0,
    };

    const monthRecords = Object.entries(attendance).filter(([dateStr]) =>
      dateStr.startsWith(selectedMonth),
    );

    monthRecords.forEach(([, dayRecord]) => {
      Object.values(dayRecord).forEach(status => {
        totals[status] += 1;
      });
    });

    const totalMarks = Object.values(totals).reduce((sum, x) => sum + x, 0);
    const attendanceRate =
      totalMarks > 0 ? (totals.present / totalMarks) * 100 : 0;

    return {
      ...totals,
      totalMarks,
      attendanceRate,
      trackedDays: monthRecords.length,
      employeeCount: employees.length,
    };
  }, [attendance, selectedMonth, employees.length]);

  const holidayStats = useMemo(() => {
    const monthEntries = Object.entries(holidays).filter(([dateStr]) =>
      dateStr.startsWith(selectedMonth),
    );

    let fullDays = 0;
    let partialDays = 0;
    let blockedSlots = 0;

    monthEntries.forEach(([, mark]) => {
      const trueCount = [mark.morning, mark.noon, mark.evening].filter(
        Boolean,
      ).length;
      blockedSlots += trueCount;
      if (trueCount >= 3) fullDays += 1;
      else if (trueCount > 0) partialDays += 1;
    });

    return { fullDays, partialDays, blockedSlots };
  }, [holidays, selectedMonth]);

  const trendData = useMemo(() => {
    const months = getMonthSequence(selectedMonth, 6);

    return months.map(monthKey => {
      const monthIncomeTotal = income
        .filter(entry => entry.date.startsWith(monthKey))
        .reduce((sum, x) => sum + (x.amount || 0), 0);
      const monthExpenseTotal = expenses
        .filter(entry => entry.date.startsWith(monthKey))
        .reduce((sum, x) => sum + (x.amount || 0), 0);

      return {
        monthKey,
        monthLabel: monthLabel(monthKey).replace(' ', '\n'),
        income: monthIncomeTotal,
        expenses: monthExpenseTotal,
        net: monthIncomeTotal - monthExpenseTotal,
      };
    });
  }, [selectedMonth, income, expenses]);

  const appointmentChartData = [
    { name: 'Scheduled', value: appointmentStats.scheduled },
    { name: 'Completed', value: appointmentStats.completed },
    { name: 'Rescheduled', value: appointmentStats.rescheduled },
    { name: 'Cancelled', value: appointmentStats.cancelled },
  ];

  const attendanceChartData = [
    { name: 'Present', value: attendanceStats.present },
    { name: 'Absent', value: attendanceStats.absent },
    { name: 'Half-Day', value: attendanceStats['half-day'] },
    { name: 'Leave', value: attendanceStats.leave },
  ];

  const fmtAmount = (amount: number) =>
    `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const tooltipCountFormatter = (value: unknown) =>
    asNumber(value).toLocaleString('en-IN');
  const tooltipAmountFormatter = (value: unknown) => fmtAmount(asNumber(value));

  return (
    <section className="doctor-overview-page">
      <div className="overview-head">
        <h1 className="dash-page-title">
          <Activity size={22} /> Clinic Dashboard Overview
        </h1>
        <label className="overview-month-picker">
          <span>Reporting Month</span>
          <select
            value={selectedMonth}
            onChange={event => setSelectedMonth(event.target.value)}
          >
            {allMonthKeys.map(month => (
              <option key={month} value={month}>
                {monthLabel(month)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overview-kpi-grid">
        <article className="overview-kpi-card">
          <header>
            <CalendarClock size={16} /> Appointments
          </header>
          <strong>{monthAppointments.length}</strong>
          <p>Total booked this month</p>
        </article>
        <article className="overview-kpi-card">
          <header>
            <CheckCircle2 size={16} /> Completed
          </header>
          <strong>{appointmentStats.completed}</strong>
          <p>Consultations done</p>
        </article>
        <article className="overview-kpi-card">
          <header>
            <RefreshCcw size={16} /> Rescheduled
          </header>
          <strong>{appointmentStats.rescheduled}</strong>
          <p>Explicit plus inferred from cancellations</p>
        </article>
        <article className="overview-kpi-card">
          <header>
            <XCircle size={16} /> Cancelled
          </header>
          <strong>{appointmentStats.cancelled}</strong>
          <p>Appointments cancelled</p>
        </article>
        <article className="overview-kpi-card">
          <header>
            <Users size={16} /> Follow-up Visits
          </header>
          <strong>{appointmentStats.followUpCount}</strong>
          <p>Patients returning for next appointment</p>
        </article>
        <article className="overview-kpi-card">
          <header>
            <IndianRupee size={16} /> Net Cashflow
          </header>
          <strong>{fmtAmount(totalIncome - totalExpenses)}</strong>
          <p>
            Income {fmtAmount(totalIncome)} / Expense {fmtAmount(totalExpenses)}
          </p>
        </article>
      </div>

      <div className="overview-chart-grid">
        <article className="dash-card overview-chart-card">
          <h3>Appointment Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={appointmentChartData}
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipCountFormatter} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="dash-card overview-chart-card">
          <h3>Income vs Expense (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
              <XAxis
                dataKey="monthKey"
                tickFormatter={value => value.slice(2)}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipAmountFormatter} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#fb7185"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="overview-chart-grid">
        <article className="dash-card overview-chart-card">
          <h3>Income Areas (This Month)</h3>
          <p className="overview-chart-total income">
            Total: <strong>{fmtAmount(totalIncome)}</strong>
          </p>
          {incomeBySource.length === 0 ? (
            <p className="overview-empty">No income entries in this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={incomeBySource}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  labelLine={false}
                >
                  {incomeBySource.map((slice, index) => (
                    <Cell
                      key={slice.name}
                      fill={INCOME_PIE_COLORS[index % INCOME_PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipAmountFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </article>

        <article className="dash-card overview-chart-card">
          <h3>Expense Areas (This Month)</h3>
          <p className="overview-chart-total expense">
            Total: <strong>{fmtAmount(totalExpenses)}</strong>
          </p>
          {expensesByCategory.length === 0 ? (
            <p className="overview-empty">No expense entries in this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  labelLine={false}
                >
                  {expensesByCategory.map((slice, index) => (
                    <Cell
                      key={slice.name}
                      fill={
                        EXPENSE_PIE_COLORS[index % EXPENSE_PIE_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipAmountFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </article>
      </div>

      <div className="overview-bottom-grid">
        <article className="dash-card overview-info-card">
          <h3>
            <Syringe size={16} /> Vaccination Insights
          </h3>
          <ul>
            <li>
              Vaccination visits logged: {vaccinationStats.vaccinationVisits}
            </li>
            <li>
              Vaccination revenue:{' '}
              {fmtAmount(vaccinationStats.vaccinationRevenue)}
            </li>
            <li>
              Available vaccine doses in stock:{' '}
              {vaccinationStats.availableDoses}
            </li>
            <li>
              Vaccine entries expiring in 30 days:{' '}
              {vaccinationStats.expiringSoon}
            </li>
          </ul>
        </article>

        <article className="dash-card overview-info-card">
          <h3>
            <Users size={16} /> Employee Attendance Summary
          </h3>
          <div className="overview-mini-chart">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={attendanceChartData}
                margin={{ left: 0, right: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#67e8f9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul>
            <li>Tracked days: {attendanceStats.trackedDays}</li>
            <li>Employees configured: {attendanceStats.employeeCount}</li>
            <li>Total attendance marks: {attendanceStats.totalMarks}</li>
            <li>Presence rate: {attendanceStats.attendanceRate.toFixed(1)}%</li>
          </ul>
        </article>

        <article className="dash-card overview-info-card">
          <h3>
            <UmbrellaOff size={16} /> Holiday Summary
          </h3>
          <ul>
            <li>Full holiday days: {holidayStats.fullDays}</li>
            <li>Partial holiday days: {holidayStats.partialDays}</li>
            <li>Total blocked slots: {holidayStats.blockedSlots}</li>
            <li>Month in report: {monthLabel(selectedMonth)}</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default DoctorOverview;
