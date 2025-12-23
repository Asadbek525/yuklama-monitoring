export interface WorkloadData {
  aerob: number[];
  aralash: number[];
  anaerob: number[];
  sakrash: number[];
  sport: number[];
  maxsus: number[];
}

export interface GroupData {
  id: string;
  name: string;
  data: WorkloadData;
}

