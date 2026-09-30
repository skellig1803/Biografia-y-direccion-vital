// run_validation.ts
// Compute natal charts for the four test cases and output results for comparison
import { computeSwissEphemerisChart } from './server/swissEphemeris';
import { writeFileSync } from 'fs';

interface TestCase {
  name: string;
  birthData: {
    birthDate: string;
    birthTime: string;
    timezoneOffset: number;
    latitude: string;
    longitude: string;
    ianaTimeZone?: string;
    nodeType?: 'true' | 'mean';
    name: string;
    placeName: string;
  };
}

const testCases: TestCase[] = [
  {
    name: 'Albert Einstein',
    birthData: {
      name: 'Albert Einstein',
      birthDate: '1879-03-14',
      birthTime: '11:30:00',
      // LMT Ulm: longitude 10°00'E → offset = 10/15 = 0.6667h
      // The test file says UTC = 10:50:00, so offset = 11:30 - 10:50 = 0:40 = 0.6667h
      timezoneOffset: 0.6666667,
      latitude: '48.4',      // 48°24'N
      longitude: '10.0',     // 10°00'E
      placeName: 'Ulm, Alemania',
      nodeType: 'mean',      // Test file specifies "Nodo Medio"
    },
  },
  {
    name: 'Carl Gustav Jung',
    birthData: {
      name: 'Carl Gustav Jung',
      birthDate: '1875-07-26',
      birthTime: '19:24:00',
      // LMT Kesswil: longitude 9°20'E → offset = 9.3333/15 = 0.6222h ≈ 37m20s
      // Test file says UTC = 18:54:14, so offset = 19:24:00 - 18:54:14 = 0:29:46 = 0.4961h
      timezoneOffset: 0.49611,
      latitude: '47.6',      // 47°36'N
      longitude: '9.3333',   // 09°20'E
      placeName: 'Kesswil, Suiza',
      nodeType: 'mean',
    },
  },
  {
    name: 'Barack Obama',
    birthData: {
      name: 'Barack Obama',
      birthDate: '1961-08-04',
      birthTime: '19:24:00',
      timezoneOffset: -10,   // AHST = UTC-10
      latitude: '21.3',      // 21°18'N
      longitude: '-157.8667', // 157°52'W
      placeName: 'Honolulu, Hawái',
      ianaTimeZone: 'Pacific/Honolulu',
      nodeType: 'mean',
    },
  },
  {
    name: 'Edvard Munch',
    birthData: {
      name: 'Edvard Munch',
      birthDate: '1863-12-12',
      birthTime: '22:00:00',
      // LMT Løten: longitude 11°20'E → offset = 11.3333/15 = 0.75556h ≈ 45m20s
      // Test file says approx UTC+0:45:13 ≈ 0.75361h
      timezoneOffset: 0.75361,
      latitude: '60.7833',   // 60°47'N
      longitude: '11.3333',  // 11°20'E
      placeName: 'Løten, Noruega',
      nodeType: 'mean',
    },
  },
];

function run() {
  const results: Record<string, any> = {};
  for (const tc of testCases) {
    try {
      const chart = computeSwissEphemerisChart(tc.birthData as any);
      results[tc.name] = {
        planets: chart.planets.map((p: any) => ({
          id: p.id,
          formatted: p.formatted,
          longitude: p.longitude,
          isRetrograde: p.isRetrograde || false,
        })),
        houses: chart.houses.map((h: any) => ({
          house: h.house,
          formatted: h.formatted,
          longitude: h.longitude,
        })),
      };
    } catch (err: any) {
      results[tc.name] = { error: err.message };
    }
  }
  writeFileSync('validation_results.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('Validation results written to validation_results.json');
}

run();
