import { GeoEvent } from '@/lib/types';

interface VolcanoRecord {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  elevation_m: number;
  status: 'erupting' | 'restless' | 'active';
  lastEruption?: string;
}

// Curated list of currently active or recently restless volcanoes (GVP/USGS)
const ACTIVE_VOLCANOES: VolcanoRecord[] = [
  { id: 'kilauea',      name: 'Kīlauea',              country: 'United States',   lat: 19.421,  lng: -155.287, elevation_m: 1222,  status: 'erupting',  lastEruption: '2024' },
  { id: 'mauna-loa',   name: 'Mauna Loa',             country: 'United States',   lat: 19.475,  lng: -155.608, elevation_m: 4169,  status: 'active',    lastEruption: '2022' },
  { id: 'etna',        name: 'Mount Etna',            country: 'Italy',           lat: 37.734,  lng: 15.004,   elevation_m: 3357,  status: 'erupting',  lastEruption: '2024' },
  { id: 'stromboli',   name: 'Stromboli',             country: 'Italy',           lat: 38.789,  lng: 15.213,   elevation_m: 924,   status: 'erupting',  lastEruption: '2024' },
  { id: 'sakurajima',  name: 'Sakurajima',            country: 'Japan',           lat: 31.585,  lng: 130.657,  elevation_m: 1117,  status: 'erupting',  lastEruption: '2024' },
  { id: 'merapi',      name: 'Merapi',                country: 'Indonesia',       lat: -7.541,  lng: 110.446,  elevation_m: 2930,  status: 'erupting',  lastEruption: '2024' },
  { id: 'sinabung',    name: 'Sinabung',              country: 'Indonesia',       lat: 3.170,   lng: 98.392,   elevation_m: 2460,  status: 'restless',  lastEruption: '2021' },
  { id: 'krakatau',    name: 'Anak Krakatau',         country: 'Indonesia',       lat: -6.102,  lng: 105.423,  elevation_m: 157,   status: 'active',    lastEruption: '2024' },
  { id: 'semeru',      name: 'Semeru',                country: 'Indonesia',       lat: -8.108,  lng: 112.922,  elevation_m: 3676,  status: 'erupting',  lastEruption: '2024' },
  { id: 'popocatepetl',name: 'Popocatépetl',         country: 'Mexico',          lat: 19.023,  lng: -98.622,  elevation_m: 5426,  status: 'erupting',  lastEruption: '2024' },
  { id: 'colima',      name: 'Colima',                country: 'Mexico',          lat: 19.514,  lng: -103.620, elevation_m: 3860,  status: 'active',    lastEruption: '2023' },
  { id: 'piton',       name: 'Piton de la Fournaise', country: 'France/Réunion',  lat: -21.244, lng: 55.708,   elevation_m: 2632,  status: 'erupting',  lastEruption: '2024' },
  { id: 'nyiragongo',  name: 'Nyiragongo',            country: 'DR Congo',        lat: -1.522,  lng: 29.250,   elevation_m: 3470,  status: 'active',    lastEruption: '2021' },
  { id: 'erta-ale',    name: 'Erta Ale',              country: 'Ethiopia',        lat: 13.600,  lng: 40.670,   elevation_m: 613,   status: 'erupting',  lastEruption: '2024' },
  { id: 'erebus',      name: 'Mount Erebus',          country: 'Antarctica',      lat: -77.530, lng: 167.170,  elevation_m: 3794,  status: 'active',    lastEruption: '2024' },
  { id: 'ruapehu',     name: 'Ruapehu',               country: 'New Zealand',     lat: -39.281, lng: 175.564,  elevation_m: 2797,  status: 'active',    lastEruption: '2007' },
  { id: 'whakaari',    name: 'Whakaari (White Island)',country: 'New Zealand',    lat: -37.521, lng: 177.183,  elevation_m: 321,   status: 'restless',  lastEruption: '2019' },
  { id: 'taal',        name: 'Taal',                  country: 'Philippines',     lat: 14.002,  lng: 120.993,  elevation_m: 311,   status: 'restless',  lastEruption: '2022' },
  { id: 'bulusan',     name: 'Bulusan',               country: 'Philippines',     lat: 12.770,  lng: 124.055,  elevation_m: 1559,  status: 'active',    lastEruption: '2023' },
  { id: 'ulawun',      name: 'Ulawun',                country: 'Papua New Guinea',lat: -5.050,  lng: 151.330,  elevation_m: 2334,  status: 'erupting',  lastEruption: '2024' },
  { id: 'tavurvur',    name: 'Tavurvur',              country: 'Papua New Guinea',lat: -4.271,  lng: 152.203,  elevation_m: 688,   status: 'active',    lastEruption: '2014' },
  { id: 'galeras',     name: 'Galeras',               country: 'Colombia',        lat: 1.220,   lng: -77.360,  elevation_m: 4276,  status: 'restless',  lastEruption: '2023' },
  { id: 'nevado-ruiz', name: 'Nevado del Ruiz',       country: 'Colombia',        lat: 4.895,   lng: -75.322,  elevation_m: 5321,  status: 'erupting',  lastEruption: '2024' },
  { id: 'tungurahua',  name: 'Tungurahua',            country: 'Ecuador',         lat: -1.467,  lng: -78.442,  elevation_m: 5023,  status: 'restless',  lastEruption: '2016' },
  { id: 'reventador',  name: 'Reventador',            country: 'Ecuador',         lat: -0.077,  lng: -77.656,  elevation_m: 3562,  status: 'erupting',  lastEruption: '2024' },
  { id: 'sangay',      name: 'Sangay',                country: 'Ecuador',         lat: -2.005,  lng: -78.341,  elevation_m: 5286,  status: 'erupting',  lastEruption: '2024' },
  { id: 'soufriere-sv',name: 'La Soufrière',          country: 'St. Vincent',     lat: 13.336,  lng: -61.180,  elevation_m: 1234,  status: 'active',    lastEruption: '2021' },
  { id: 'la-palma',    name: 'Cumbre Vieja',          country: 'Spain',           lat: 28.600,  lng: -17.840,  elevation_m: 1949,  status: 'active',    lastEruption: '2021' },
  { id: 'fuego',       name: 'Fuego',                 country: 'Guatemala',       lat: 14.473,  lng: -90.880,  elevation_m: 3763,  status: 'erupting',  lastEruption: '2024' },
  { id: 'santiaguito', name: 'Santiaguito',           country: 'Guatemala',       lat: 14.756,  lng: -91.552,  elevation_m: 2550,  status: 'erupting',  lastEruption: '2024' },
  { id: 'pacaya',      name: 'Pacaya',                country: 'Guatemala',       lat: 14.381,  lng: -90.601,  elevation_m: 2552,  status: 'erupting',  lastEruption: '2024' },
  { id: 'poas',        name: 'Poás',                  country: 'Costa Rica',      lat: 10.200,  lng: -84.233,  elevation_m: 2708,  status: 'restless',  lastEruption: '2024' },
  { id: 'turrialba',   name: 'Turrialba',             country: 'Costa Rica',      lat: 10.025,  lng: -83.767,  elevation_m: 3340,  status: 'active',    lastEruption: '2021' },
  { id: 'masaya',      name: 'Masaya',                country: 'Nicaragua',       lat: 11.985,  lng: -86.161,  elevation_m: 635,   status: 'active',    lastEruption: '2024' },
  { id: 'villarrica',  name: 'Villarrica',            country: 'Chile',           lat: -39.420, lng: -71.937,  elevation_m: 2847,  status: 'erupting',  lastEruption: '2024' },
  { id: 'calbuco',     name: 'Calbuco',               country: 'Chile',           lat: -41.326, lng: -72.614,  elevation_m: 2003,  status: 'active',    lastEruption: '2015' },
  { id: 'yasur',       name: 'Yasur',                 country: 'Vanuatu',         lat: -19.532, lng: 169.447,  elevation_m: 361,   status: 'erupting',  lastEruption: '2024' },
  { id: 'ambrym',      name: 'Ambrym',                country: 'Vanuatu',         lat: -16.250, lng: 168.120,  elevation_m: 1334,  status: 'active',    lastEruption: '2022' },
  { id: 'veniaminof',  name: 'Veniaminof',            country: 'United States',   lat: 56.195,  lng: -159.393, elevation_m: 2507,  status: 'active',    lastEruption: '2023' },
  { id: 'cleveland',   name: 'Cleveland',             country: 'United States',   lat: 52.825,  lng: -169.944, elevation_m: 1730,  status: 'restless',  lastEruption: '2023' },
  { id: 'shishaldin',  name: 'Shishaldin',            country: 'United States',   lat: 54.756,  lng: -163.970, elevation_m: 2857,  status: 'erupting',  lastEruption: '2024' },
  { id: 'pavlof',      name: 'Pavlof',                country: 'United States',   lat: 55.418,  lng: -161.894, elevation_m: 2519,  status: 'active',    lastEruption: '2024' },
  { id: 'ol-doinyo',   name: 'Ol Doinyo Lengai',      country: 'Tanzania',        lat: -2.764,  lng: 35.902,   elevation_m: 2960,  status: 'active',    lastEruption: '2024' },
  { id: 'campi-flegrei',name: 'Campi Flegrei',        country: 'Italy',           lat: 40.827,  lng: 14.139,   elevation_m: 458,   status: 'restless',  lastEruption: '1538' },
  { id: 'vesuvius',    name: 'Vesuvius',              country: 'Italy',           lat: 40.821,  lng: 14.426,   elevation_m: 1281,  status: 'active',    lastEruption: '1944' },
  { id: 'katla',       name: 'Katla',                 country: 'Iceland',         lat: 63.633,  lng: -19.058,  elevation_m: 1512,  status: 'restless',  lastEruption: '1918' },
  { id: 'grimsvotn',   name: 'Grímsvötn',             country: 'Iceland',         lat: 64.416,  lng: -17.316,  elevation_m: 1725,  status: 'active',    lastEruption: '2021' },
  { id: 'hekla',       name: 'Hekla',                 country: 'Iceland',         lat: 63.983,  lng: -19.666,  elevation_m: 1491,  status: 'restless',  lastEruption: '2000' },
];

export function fetchVolcanoes(): GeoEvent[] {
  return ACTIVE_VOLCANOES.map((v) => ({
    id: `volcano-${v.id}`,
    layer: 'volcano' as const,
    lat: v.lat,
    lng: v.lng,
    timestamp: 0,
    magnitude: v.status === 'erupting' ? 0.9 : v.status === 'restless' ? 0.6 : 0.3,
    label: v.name,
    meta: {
      country: v.country,
      elevation_m: v.elevation_m,
      status: v.status,
      lastEruption: v.lastEruption,
    },
  }));
}
