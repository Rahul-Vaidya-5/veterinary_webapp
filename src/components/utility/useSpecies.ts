import { useEffect, useState } from 'react';
import speciesDataUrl from '../../assets/json/master/species.json?url';

type SpeciesRecord = {
  speciesId: number;
  speciesNameEnglish: string;
  speciesNameHindi: string;
  category: string;
};

type SpeciesData = {
  species: SpeciesRecord[];
};

let cachedSpeciesNames: string[] | null = null;

export function useSpecies() {
  const [speciesNames, setSpeciesNames] = useState<string[]>(
    cachedSpeciesNames ?? [],
  );

  useEffect(() => {
    if (cachedSpeciesNames) {
      setSpeciesNames(cachedSpeciesNames);
      return;
    }

    fetch(speciesDataUrl)
      .then(res => res.json())
      .then((data: SpeciesData) => {
        const names = data.species.map(s => s.speciesNameEnglish);
        cachedSpeciesNames = names;
        setSpeciesNames(names);
      })
      .catch(err => console.error('Failed to load species master:', err));
  }, []);

  return { speciesNames };
}
