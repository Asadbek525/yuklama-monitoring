import {GroupData} from '../src/app/models/workload.model';
import * as stg1 from './stg-1';
import * as stg2 from './stg-2';

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
    name: '1-Guruh',
    data: {
      ...stg1
    },
  },
  {
    id: 'stg-2',
    name: '2-Guruh',
    data: {
      ...stg2
    },
  },
];
