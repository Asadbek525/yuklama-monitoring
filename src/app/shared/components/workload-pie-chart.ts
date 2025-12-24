import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { WorkloadData } from '../../models/workload.model';

@Component({
  selector: 'app-workload-pie-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <div
      echarts
      [options]="chartOptions()"
      class="h-64 w-full"
      aria-label="Aerob, aralash, anaerob va sakrash umumiy qiymatlarini taqqoslovchi doiraviy grafik"
      role="img"
    ></div>
  `,
})
export class WorkloadPieChartComponent {
  readonly data = input.required<WorkloadData>();

  readonly chartOptions = computed<EChartsOption>(() => {
    const workload = this.data();

    // Calculate sum of each category
    const sumAerob = workload.aerob.reduce((a, b) => a + b, 0);
    const sumAralash = workload.aralash.reduce((a, b) => a + b, 0);
    const sumAnaerob = workload.anaerob.reduce((a, b) => a + b, 0);
    const sumSakrash = workload.sakrash.reduce((a, b) => a + b, 0);

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; percent: number };
          return `<strong>${p.name}</strong><br/>Jami: ${p.value.toFixed(1)} km<br/>Ulushi: ${p.percent.toFixed(1)}%`;
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemGap: 12,
      },
      series: [
        {
          name: 'Yuklama taqsimoti',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: (params) => {
              console.log(params)
              const percent = params!.percent!;
              const value = (params!.data as any).value;
              return `${params.name}\n${percent.toFixed(1)}% (${value!.toFixed(1)} km)`;
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: true,
          },
          data: [
            { value: sumAerob, name: 'Aerob yuklama', itemStyle: { color: '#22c55e' } },
            { value: sumAralash, name: 'Aralash yuklama', itemStyle: { color: '#eab308' } },
            { value: sumAnaerob, name: 'Anaerob yuklama', itemStyle: { color: '#ef4444' } },
            { value: sumSakrash, name: 'Sakrashlar', itemStyle: { color: '#3b82f6' } },
          ],
        },
      ],
    };
  });
}

