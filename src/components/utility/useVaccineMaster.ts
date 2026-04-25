import { useState, useEffect } from 'react';
import vaccinesUrl from '../../assets/json/master/animal/vaccines.json?url';

const LS_KEY = 'vc_custom_vaccines';
let cachedVaccines: string[] | null = null;

const loadCustom = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const saveCustom = (list: string[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
};

const dedupe = (list: string[]): string[] => {
  const seen = new Set<string>();
  return list.filter(v => {
    const key = v.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export function useVaccineMaster() {
  const [vaccineOptions, setVaccineOptions] = useState<string[]>(
    cachedVaccines ?? [],
  );

  useEffect(() => {
    if (cachedVaccines !== null) {
      setVaccineOptions(cachedVaccines);
      return;
    }
    fetch(vaccinesUrl)
      .then(r => r.json())
      .then((master: string[]) => {
        const merged = dedupe([...master, ...loadCustom()]);
        cachedVaccines = merged;
        setVaccineOptions(merged);
      })
      .catch(() => {
        const fallback = loadCustom();
        cachedVaccines = fallback;
        setVaccineOptions(fallback);
      });
  }, []);

  const addVaccine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !cachedVaccines) return;
    const already = cachedVaccines.some(
      v => v.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (already) return;
    const custom = loadCustom();
    const updated = dedupe([...custom, trimmed]);
    saveCustom(updated);
    cachedVaccines = dedupe([...cachedVaccines, trimmed]);
    setVaccineOptions([...cachedVaccines]);
  };

  return { vaccineOptions, addVaccine };
}
