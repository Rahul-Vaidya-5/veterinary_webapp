import { useEffect, useState } from 'react';
import speciesDataUrl from '../../assets/json/master/species.json?url';
import breedDataUrl from '../../assets/json/master/breed.json?url';
import dogBreedDataUrl from '../../assets/json/master/breeds/dog.json?url';
import catBreedDataUrl from '../../assets/json/master/breeds/cat.json?url';
import cowBreedDataUrl from '../../assets/json/master/breeds/cow.json?url';
import parrotBreedDataUrl from '../../assets/json/master/breeds/parrot.json?url';
import buffaloBreedDataUrl from '../../assets/json/master/breeds/buffalo.json?url';
import bullBreedDataUrl from '../../assets/json/master/breeds/bull.json?url';
import goatBreedDataUrl from '../../assets/json/master/breeds/goat.json?url';
import horseBreedDataUrl from '../../assets/json/master/breeds/horse.json?url';
import camelBreedDataUrl from '../../assets/json/master/breeds/camel.json?url';
import chickenBreedDataUrl from '../../assets/json/master/breeds/chicken.json?url';
import monkeyBreedDataUrl from '../../assets/json/master/breeds/monkey.json?url';
import sheepBreedDataUrl from '../../assets/json/master/breeds/sheep.json?url';

type SpeciesRecord = {
  speciesId: number;
  speciesNameEnglish: string;
};

type BreedRecord = {
  breedId: number;
  speciesId?: number;
  speciesNameEnglish?: string;
  breedNameEnglish: string;
};

type SpeciesData = {
  species: SpeciesRecord[];
};

type BreedData = {
  breeds: BreedRecord[];
};

type SpeciesBreedFileData = {
  speciesId: number;
  speciesNameEnglish: string;
  breeds: BreedRecord[];
};

type SpeciesBreedsCache = {
  speciesNames: string[];
  speciesNameToId: Record<string, number>;
  breedsBySpeciesId: Record<number, string[]>;
};

let cache: SpeciesBreedsCache | null = null;

const splitBreedDataUrls = [
  dogBreedDataUrl,
  catBreedDataUrl,
  cowBreedDataUrl,
  parrotBreedDataUrl,
  buffaloBreedDataUrl,
  bullBreedDataUrl,
  goatBreedDataUrl,
  horseBreedDataUrl,
  camelBreedDataUrl,
  chickenBreedDataUrl,
  monkeyBreedDataUrl,
  sheepBreedDataUrl,
];

const normalize = (value: string) => value.trim().toLowerCase();

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

function buildCache(
  speciesData: SpeciesData,
  breedDataList: BreedData[],
): SpeciesBreedsCache {
  const speciesNameToId: Record<string, number> = {};
  const speciesNames = speciesData.species.map(species => {
    speciesNameToId[normalize(species.speciesNameEnglish)] = species.speciesId;
    return species.speciesNameEnglish;
  });

  const breedsBySpeciesId: Record<number, string[]> = {};

  for (const breedData of breedDataList) {
    for (const breed of breedData.breeds) {
      const resolvedSpeciesId =
        breed.speciesId ??
        (breed.speciesNameEnglish
          ? speciesNameToId[normalize(breed.speciesNameEnglish)]
          : undefined);

      if (!resolvedSpeciesId) {
        continue;
      }

      breedsBySpeciesId[resolvedSpeciesId] = [
        ...(breedsBySpeciesId[resolvedSpeciesId] ?? []),
        breed.breedNameEnglish,
      ];
    }
  }

  for (const speciesId of Object.keys(breedsBySpeciesId)) {
    const numericId = Number(speciesId);
    breedsBySpeciesId[numericId] = dedupe(breedsBySpeciesId[numericId]);
  }

  return {
    speciesNames,
    speciesNameToId,
    breedsBySpeciesId,
  };
}

export function useSpeciesBreeds() {
  const [speciesNames, setSpeciesNames] = useState<string[]>(
    cache?.speciesNames ?? [],
  );
  const [speciesNameToId, setSpeciesNameToId] = useState<
    Record<string, number>
  >(cache?.speciesNameToId ?? {});
  const [breedsBySpeciesId, setBreedsBySpeciesId] = useState<
    Record<number, string[]>
  >(cache?.breedsBySpeciesId ?? {});

  useEffect(() => {
    if (cache) {
      setSpeciesNames(cache.speciesNames);
      setSpeciesNameToId(cache.speciesNameToId);
      setBreedsBySpeciesId(cache.breedsBySpeciesId);
      return;
    }

    Promise.all([
      fetch(speciesDataUrl).then(res => res.json() as Promise<SpeciesData>),
      fetch(breedDataUrl).then(res => res.json() as Promise<BreedData>),
      ...splitBreedDataUrls.map(url =>
        fetch(url).then(res => res.json() as Promise<SpeciesBreedFileData>),
      ),
    ])
      .then(([speciesData, fallbackBreedData, ...splitBreedData]) => {
        const allBreedData: BreedData[] = [
          fallbackBreedData as BreedData,
          ...(splitBreedData as SpeciesBreedFileData[]).map(fileData => ({
            breeds: fileData.breeds,
          })),
        ];

        cache = buildCache(speciesData as SpeciesData, allBreedData);
        setSpeciesNames(cache.speciesNames);
        setSpeciesNameToId(cache.speciesNameToId);
        setBreedsBySpeciesId(cache.breedsBySpeciesId);
      })
      .catch(error => {
        console.error('Failed to load species/breed masters:', error);
      });
  }, []);

  const getBreedsForSpecies = (speciesName: string) => {
    const speciesId = speciesNameToId[normalize(speciesName)];
    if (!speciesId) {
      return [];
    }

    return breedsBySpeciesId[speciesId] ?? [];
  };

  return {
    speciesNames,
    getBreedsForSpecies,
  };
}
