import { computed, Injectable, signal } from '@angular/core';
import { groups } from '../../../data';
import { GroupData } from '../models/workload.model';

@Injectable({
  providedIn: 'root',
})
export class WorkloadService {
  readonly groups = signal<GroupData[]>(groups);

  readonly selectedGroupId = signal<string>(groups[0]?.id ?? '');

  readonly selectedGroup = computed(() => {
    const id = this.selectedGroupId();
    return this.groups().find((g) => g.id === id) ?? this.groups()[0];
  });

  selectGroup(id: string): void {
    this.selectedGroupId.set(id);
  }
}

