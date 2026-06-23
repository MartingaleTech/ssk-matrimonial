/**
 * Vedic Astrology Kundali Engine
 * Computes rashi, nakshatra, lagna, planetary positions, houses, doshas
 * and performs 36-point Ashta-Koota Guna Matching.
 */

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Moola',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

const RASHIS = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrischika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
];

const PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];

interface KundaliResult {
  rashi: string;
  nakshatra: string;
  lagna: string;
  manglik_status: string;
  planetary_positions: Record<string, unknown>;
  houses: Record<string, unknown>;
  doshas: Record<string, unknown>;
}

interface GunaMatchResult {
  guna_total_score: number;
  guna_breakdown: Record<string, number>;
  match_quality: string;
}

function computeJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number,
): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    hour / 24 +
    B -
    1524.5
  );
}

function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = (218.3164477 + 481267.88123421 * T - 0.0015786 * T * T) % 360;
  return ((L % 360) + 360) % 360;
}

function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const M = (357.5291092 + 35999.0502909 * T) % 360;
  const Mrad = (M * Math.PI) / 180;
  const C =
    (1.9146 - 0.004817 * T) * Math.sin(Mrad) + 0.019993 * Math.sin(2 * Mrad);
  const sunLong = (280.46646 + 36000.76983 * T + 0.0003032 * T * T + C) % 360;
  return ((sunLong % 360) + 360) % 360;
}

export function generateKundali(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  timezone: string,
): KundaliResult {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hours, minutes] = birthTime.split(':').map(Number);
  const tzOffset = parseTzOffset(timezone);
  const utcHour = hours + minutes / 60 - tzOffset;

  const jd = computeJulianDay(year, month, day, utcHour);
  const moonLong = getMoonLongitude(jd);
  const sunLong = getSunLongitude(jd);

  const rashiIndex = Math.floor(moonLong / 30);
  const rashi = RASHIS[rashiIndex];

  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Lagna (Ascendant) approximation based on local sidereal time
  const lst = (sunLong + (utcHour + longitude / 15) * 15) % 360;
  const lagnaLong = (lst + latitude * 0.1) % 360;
  const lagnaIndex = Math.floor((((lagnaLong % 360) + 360) % 360) / 30);
  const lagna = RASHIS[lagnaIndex];

  // Planetary positions (simplified)
  const planetary_positions: Record<string, unknown> = {};
  for (const planet of PLANETS) {
    const offset = PLANETS.indexOf(planet) * 37.5;
    const pLong = (sunLong + offset + jd * 0.01) % 360;
    const normalizedLong = ((pLong % 360) + 360) % 360;
    planetary_positions[planet] = {
      longitude: Math.round(normalizedLong * 100) / 100,
      rashi: RASHIS[Math.floor(normalizedLong / 30)],
      nakshatra: NAKSHATRAS[Math.floor(normalizedLong / (360 / 27))],
    };
  }

  // Houses
  const houses: Record<string, unknown> = {};
  for (let i = 1; i <= 12; i++) {
    const houseLong = (lagnaLong + (i - 1) * 30) % 360;
    houses[`house_${i}`] = {
      longitude: Math.round(houseLong * 100) / 100,
      rashi: RASHIS[Math.floor(houseLong / 30)],
    };
  }

  // Manglik check: Mars in houses 1, 2, 4, 7, 8, 12
  const marsPos = planetary_positions['Mars'] as { longitude: number };
  const marsHouse =
    Math.floor(((marsPos.longitude - lagnaLong + 360) % 360) / 30) + 1;
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const manglik_status = manglikHouses.includes(marsHouse)
    ? 'manglik'
    : 'non_manglik';

  // Doshas
  const doshas: Record<string, unknown> = {
    manglik: manglik_status === 'manglik',
    kaal_sarp: checkKaalSarp(planetary_positions),
  };

  return {
    rashi,
    nakshatra,
    lagna,
    manglik_status,
    planetary_positions,
    houses,
    doshas,
  };
}

function checkKaalSarp(positions: Record<string, unknown>): boolean {
  const rahuLong = (positions['Rahu'] as { longitude: number }).longitude;
  const ketuLong = (positions['Ketu'] as { longitude: number }).longitude;

  let allBetween = true;
  for (const planet of [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ]) {
    const pLong = (positions[planet] as { longitude: number }).longitude;
    const between = isLongBetween(pLong, rahuLong, ketuLong);
    if (!between) {
      allBetween = false;
      break;
    }
  }
  return allBetween;
}

function isLongBetween(point: number, start: number, end: number): boolean {
  if (start < end) {
    return point >= start && point <= end;
  }
  return point >= start || point <= end;
}

function parseTzOffset(timezone: string): number {
  if (!timezone) return 5.5; // default IST
  const match = timezone.match(/([+-]?)(\d{1,2}):?(\d{2})?/);
  if (!match) return 5.5;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2]);
  const minutes = parseInt(match[3] || '0');
  return sign * (hours + minutes / 60);
}

/**
 * Ashta-Koota Guna Matching (36 points total)
 * 8 Kootas: Varna(1), Vashya(2), Tara(3), Yoni(4), Graha Maitri(5), Gana(3), Bhakoot(7), Nadi(8)
 */
export function computeGunaMatch(
  rashi1: string,
  nakshatra1: string,
  rashi2: string,
  nakshatra2: string,
): GunaMatchResult {
  const r1 = RASHIS.indexOf(rashi1);
  const r2 = RASHIS.indexOf(rashi2);
  const n1 = NAKSHATRAS.indexOf(nakshatra1);
  const n2 = NAKSHATRAS.indexOf(nakshatra2);

  if (r1 === -1 || r2 === -1 || n1 === -1 || n2 === -1) {
    return {
      guna_total_score: 0,
      guna_breakdown: {
        varna: 0,
        vashya: 0,
        tara: 0,
        yoni: 0,
        graha_maitri: 0,
        gana: 0,
        bhakoot: 0,
        nadi: 0,
      },
      match_quality: 'invalid_data',
    };
  }

  const varna = computeVarna(r1, r2);
  const vashya = computeVashya(r1, r2);
  const tara = computeTara(n1, n2);
  const yoni = computeYoni(n1, n2);
  const grahaMaitri = computeGrahaMaitri(r1, r2);
  const gana = computeGana(n1, n2);
  const bhakoot = computeBhakoot(r1, r2);
  const nadi = computeNadi(n1, n2);

  const guna_total_score =
    varna + vashya + tara + yoni + grahaMaitri + gana + bhakoot + nadi;

  const guna_breakdown: Record<string, number> = {
    varna,
    vashya,
    tara,
    yoni,
    graha_maitri: grahaMaitri,
    gana,
    bhakoot,
    nadi,
  };

  let match_quality: string;
  if (guna_total_score >= 28) match_quality = 'excellent';
  else if (guna_total_score >= 21) match_quality = 'very_good';
  else if (guna_total_score >= 18) match_quality = 'good';
  else if (guna_total_score >= 14) match_quality = 'average';
  else match_quality = 'below_average';

  return { guna_total_score, guna_breakdown, match_quality };
}

function computeVarna(r1: number, r2: number): number {
  const varnaGroup = [1, 0, 2, 0, 1, 2, 3, 0, 1, 2, 3, 0]; // Brahmin=0, Kshatriya=1, Vaishya=2, Shudra=3
  return varnaGroup[r1] >= varnaGroup[r2] ? 1 : 0;
}

function computeVashya(r1: number, r2: number): number {
  const vashyaGroup = [0, 0, 1, 2, 0, 1, 1, 2, 0, 2, 1, 2];
  if (vashyaGroup[r1] === vashyaGroup[r2]) return 2;
  if (Math.abs(vashyaGroup[r1] - vashyaGroup[r2]) === 1) return 1;
  return 0;
}

function computeTara(n1: number, n2: number): number {
  const diff = ((n2 - n1 + 27) % 27) % 9;
  const auspicious = [1, 2, 4, 6, 8];
  return auspicious.includes(diff) ? 3 : 0;
}

function computeYoni(n1: number, n2: number): number {
  const yoniAnimal = [
    0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 7, 8, 8, 6, 8, 6, 4, 4, 4, 7, 7, 7, 0, 0, 0,
    8, 1,
  ];
  if (n1 >= 27 || n2 >= 27) return 2;
  if (yoniAnimal[n1] === yoniAnimal[n2]) return 4;
  return Math.abs(yoniAnimal[n1] - yoniAnimal[n2]) <= 2 ? 2 : 1;
}

function computeGrahaMaitri(r1: number, r2: number): number {
  const lords = [4, 3, 2, 0, 1, 2, 3, 4, 5, 6, 6, 5];
  if (lords[r1] === lords[r2]) return 5;
  if (Math.abs(lords[r1] - lords[r2]) <= 1) return 4;
  if (Math.abs(lords[r1] - lords[r2]) <= 2) return 2;
  return 0;
}

function computeGana(n1: number, n2: number): number {
  const ganaGroup = [
    0, 1, 2, 0, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1,
    1, 0,
  ];
  if (n1 >= 27 || n2 >= 27) return 1;
  if (ganaGroup[n1] === ganaGroup[n2]) return 3;
  if (Math.abs(ganaGroup[n1] - ganaGroup[n2]) === 1) return 1;
  return 0;
}

function computeBhakoot(r1: number, r2: number): number {
  const diff = (r2 - r1 + 12) % 12;
  const inauspicious = [2, 5, 6, 8, 9, 12];
  const adjustedDiff = diff === 0 ? 12 : diff;
  return inauspicious.includes(adjustedDiff) ? 0 : 7;
}

function computeNadi(n1: number, n2: number): number {
  const nadiGroup = [
    0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0,
    1, 2,
  ];
  if (n1 >= 27 || n2 >= 27) return 4;
  return nadiGroup[n1] !== nadiGroup[n2] ? 8 : 0;
}
