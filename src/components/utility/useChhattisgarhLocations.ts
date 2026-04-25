import { useEffect, useMemo, useState } from 'react';
import blockDataUrl from '../../assets/json/master/block.json?url';
import districtDataUrl from '../../assets/json/master/district.json?url';

type DistrictRecord = {
  districtId: number;
  districtNameEnglish: string;
  districtNameHindi: string;
};

type DistrictDataResponse = {
  state: string;
  districts: DistrictRecord[];
};

type BlockRecord = {
  blockId: number;
  blockNameEnglish: string;
  blockNameHindi: string;
};

type BlockDistrictRecord = {
  districtId: number;
  blocks: BlockRecord[];
};

type BlockDataResponse = {
  state: string;
  districts: BlockDistrictRecord[];
};

type LocationDataset = {
  districtNames: string[];
  blocksByDistrict: Record<string, string[]>;
};

const EMPTY_DATASET: LocationDataset = {
  districtNames: [],
  blocksByDistrict: {},
};

let cachedDataset: LocationDataset | null = null;
let pendingDatasetPromise: Promise<LocationDataset> | null = null;

const normalizeValue = (value: string) => value.trim().toLowerCase();

const loadLocationDataset = async (): Promise<LocationDataset> => {
  if (cachedDataset) return cachedDataset;
  if (pendingDatasetPromise) return pendingDatasetPromise;

  pendingDatasetPromise = Promise.all([
    fetch(districtDataUrl).then(
      response => response.json() as Promise<DistrictDataResponse>,
    ),
    fetch(blockDataUrl).then(
      response => response.json() as Promise<BlockDataResponse>,
    ),
  ])
    .then(([districtData, blockData]) => {
      const districtIdToName = new Map<number, string>();

      districtData.districts.forEach(district => {
        districtIdToName.set(district.districtId, district.districtNameEnglish);
      });

      const blocksByDistrict: Record<string, string[]> = {};
      blockData.districts.forEach(districtEntry => {
        const districtName = districtIdToName.get(districtEntry.districtId);
        if (!districtName) return;

        blocksByDistrict[districtName] = districtEntry.blocks
          .map(block => block.blockNameEnglish)
          .sort((left, right) => left.localeCompare(right));
      });

      cachedDataset = {
        districtNames: districtData.districts
          .map(district => district.districtNameEnglish)
          .sort((left, right) => left.localeCompare(right)),
        blocksByDistrict,
      };

      return cachedDataset;
    })
    .catch(() => EMPTY_DATASET)
    .finally(() => {
      pendingDatasetPromise = null;
    });

  return pendingDatasetPromise;
};

export function useChhattisgarhLocations() {
  const [dataset, setDataset] = useState<LocationDataset>(
    () => cachedDataset ?? EMPTY_DATASET,
  );

  useEffect(() => {
    let isMounted = true;

    void loadLocationDataset().then(loaded => {
      if (isMounted) {
        setDataset(loaded);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const districtLookup = useMemo(() => {
    const map = new Map<string, string>();
    dataset.districtNames.forEach(districtName => {
      map.set(normalizeValue(districtName), districtName);
    });
    return map;
  }, [dataset.districtNames]);

  const getDistrictName = (value: string) =>
    districtLookup.get(normalizeValue(value));

  const getBlocksForDistrict = (districtValue: string) => {
    const districtName = getDistrictName(districtValue);
    return districtName ? (dataset.blocksByDistrict[districtName] ?? []) : [];
  };

  const isKnownDistrict = (value: string) => Boolean(getDistrictName(value));
  const isKnownBlock = (districtValue: string, blockValue: string) => {
    const normalizedBlock = normalizeValue(blockValue);
    return getBlocksForDistrict(districtValue).some(
      blockName => normalizeValue(blockName) === normalizedBlock,
    );
  };

  return {
    districtNames: dataset.districtNames,
    getBlocksForDistrict,
    isKnownDistrict,
    isKnownBlock,
  };
}
