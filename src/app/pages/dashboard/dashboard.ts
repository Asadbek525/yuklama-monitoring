import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkloadService } from '../../services/workload.service';
import { WorkloadLineChartComponent } from '../../shared/components/workload-line-chart';
import { WorkloadPieChartComponent } from '../../shared/components/workload-pie-chart';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WorkloadLineChartComponent, WorkloadPieChartComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Yuklamalar monitoringi</h1>
        <p class="mt-1 text-sm text-gray-600">Haftalik mashg'ulot ma'lumotlarini vizualizatsiya qilish</p>
      </header>

      <div class="mb-4">
        <label for="group-select" class="block text-sm font-medium text-gray-700 mb-1">
          Guruhni tanlang
        </label>
        <div class="relative w-full max-w-xs">
          <select
            id="group-select"
            class="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            [value]="selectedGroup().id"
            (change)="onGroupChange($event)"
          >
            @for (group of groups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <section class="mb-4 rounded-lg bg-white p-4 shadow">
        <h2 class="mb-2 text-lg font-semibold text-gray-800">Mashg'ulot yuklama</h2>
        <app-workload-line-chart [data]="selectedGroup().data" />
      </section>

      <section class="rounded-lg bg-white p-4 shadow">
        <h2 class="mb-2 text-lg font-semibold text-gray-800">Yuklama taqsimoti</h2>
        <app-workload-pie-chart [data]="selectedGroup().data" />
      </section>
    </div>
  `,
})
export class DashboardComponent {
  private readonly workloadService = inject(WorkloadService);

  readonly groups = this.workloadService.groups;
  readonly selectedGroup = this.workloadService.selectedGroup;

  onGroupChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.workloadService.selectGroup(target.value);
  }
}
