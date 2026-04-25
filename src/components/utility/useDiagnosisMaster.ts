import { useEffect, useState } from 'react';
import diagnosisDataUrl from '../../assets/json/master/animal/diagnosis.json?url';

type DiagnosisData = {
  diagnoses: string[];
};

const LS_CUSTOM_DIAGNOSES = 'vc_custom_diagnoses';

let cachedDiagnoses: string[] | null = null;

const normalize = (value: string) => value.trim().toLowerCase();

const dedupe = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach(value => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const key = normalize(trimmed);
    if (seen.has(key)) return;

    seen.add(key);
    result.push(trimmed);
  });

  return result;
};

const loadCustomDiagnoses = () => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(LS_CUSTOM_DIAGNOSES) ?? '[]',
    ) as string[];
    return Array.isArray(parsed) ? dedupe(parsed) : [];
  } catch {
    return [];
  }
};

const saveCustomDiagnoses = (diagnoses: string[]) => {
  localStorage.setItem(LS_CUSTOM_DIAGNOSES, JSON.stringify(diagnoses));
};

export function useDiagnosisMaster() {
  const [diagnosisOptions, setDiagnosisOptions] = useState<string[]>(
    cachedDiagnoses ?? loadCustomDiagnoses(),
  );

  useEffect(() => {
    if (cachedDiagnoses) {
      setDiagnosisOptions(cachedDiagnoses);
      return;
    }

    fetch(diagnosisDataUrl)
      .then(res => res.json() as Promise<DiagnosisData>)
      .then(data => {
        const merged = dedupe([...data.diagnoses, ...loadCustomDiagnoses()]);
        cachedDiagnoses = merged;
        setDiagnosisOptions(merged);
      })
      .catch(error => {
        console.error('Failed to load diagnosis master:', error);
      });
  }, []);

  const addDiagnosis = (diagnosis: string) => {
    const trimmed = diagnosis.trim();
    if (!trimmed) {
      return;
    }

    const next = dedupe([...(cachedDiagnoses ?? diagnosisOptions), trimmed]);
    cachedDiagnoses = next;
    setDiagnosisOptions(next);

    const customDiagnoses = loadCustomDiagnoses();
    if (!customDiagnoses.some(item => normalize(item) === normalize(trimmed))) {
      saveCustomDiagnoses([...customDiagnoses, trimmed]);
    }
  };

  return {
    diagnosisOptions,
    addDiagnosis,
  };
}
