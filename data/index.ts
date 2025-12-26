import {GroupData} from '../src/app/models/workload.model';
import * as stg1 from './stg-1';
import * as stg2 from './stg-2';
import * as stg3 from './stg-3';
import * as osmg1 from './osmg-1';
import * as omg4 from './omg-4';

/**
 * Central barrel file for all group data.
 * To add a new group:
 * 1. Create a new file (e.g., stg-2.ts) with the same export structure as stg-1.ts
 * 2. Import it here: import * as stg2 from './stg-2';
 * 3. Add an entry to the groups array below with a unique id and display name
 */
export const groups: GroupData[] = [
  {
    id: 'stg-1',
    name: 'Sport Mahoratini takomillashtirish bosqichi-1',
    data: {
      ...stg1
    },
  },
  {
    id: 'stg-2',
    name: 'Sport Mahoratini takomillashtirish bosqichi-2',
    data: {
      ...stg2
    },
  },
  {
    id: 'stg-3',
    name: 'Sport Mahoratini takomillashtirish bosqichi-3',
    data: {
      ...stg3
    },
  },
  {
    id: 'osmg-1',
    name: 'Oliy sport mahorati bosqichi-1',
    data: {
      ...osmg1
    },
  },
  {
    id: 'omg-4',
    name: "O'quv mashq bosqichi-4",
    data: {
      ...omg4
    },
  },
];
