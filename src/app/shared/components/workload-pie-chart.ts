import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { TitleComponent } from 'echarts/components';
import { WorkloadData } from '../../models/workload.model';

echarts.use([TitleComponent]);

// Quarter ranges: 4 months each
// Sen-Dek: weeks 0-16 (4+5+4+4=17 weeks)
// Yan-Apr: weeks 17-34 (5+4+4+4=17 weeks)
// May-Avg: weeks 35-51 (5+4+5+4=18 weeks)
const QUARTERS = [
  { name: 'Sen-Dek', start: 0, end: 17 },
  { name: 'Yan-Apr', start: 17, end: 34 },
  { name: 'May-Avg', start: 34, end: 52 },
];

const COLORS = {
  aerob: '#22c55e',
  aralash: '#eab308',
  anaerob: '#ef4444',
  sakrash: '#3b82f6',
};

function sumRange(arr: number[], start: number, end: number): number {
  return arr.slice(start, end).reduce((a, b) => a + b, 0);
}

@Component({
  selector: 'app-workload-pie-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <div class="space-y-4">
      <!-- Annual Pie Chart -->
      <div
        echarts
        [options]="annualChartOptions()"
        class="h-64 w-full"
        aria-label="Yillik aerob, aralash, anaerob va sakrash qiymatlarini taqqoslovchi doiraviy grafik"
        role="img"
      ></div>

      <!-- Quarterly Pie Charts -->
      <div
        echarts
        [options]="quarterlyChartOptions()"
        class="h-72 w-full"
        aria-label="Har 4 oylik davr uchun aerob, aralash, anaerob va sakrash qiymatlarini taqqoslovchi uchta doiraviy grafik"
        role="img"
      ></div>
    </div>
  `,
})
export class WorkloadPieChartComponent {
  readonly data = input.required<WorkloadData>();

  readonly annualChartOptions = computed<EChartsOption>(() => {
    const workload = this.data();

    // Calculate sum of each category for the entire year
    const sumAerob = workload.aerob.reduce((a, b) => a + b, 0);
    const sumAralash = workload.aralash.reduce((a, b) => a + b, 0);
    const sumAnaerob = workload.anaerob.reduce((a, b) => a + b, 0);
    const sumSakrash = workload.sakrash.reduce((a, b) => a + b, 0);

    return {
      title: {
        text: 'Yillik taqsimot',
        left: 'center',
        top: '2%',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#374151',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; percent: number };
          return `<strong>${p.name}</strong><br/>Jami: ${p.value.toFixed(1)} km<br/>Ulushi: ${p.percent.toFixed(1)}%`;
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        itemGap: 16,
        textStyle: {
          fontSize: 11,
        },
      },
      series: [
        {
          name: 'Yillik taqsimot',
          type: 'pie',
          radius: ['25%', '55%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
            fontSize: 11,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: true,
          },
          data: [
            { value: sumAerob, name: 'Aerob yuklama', itemStyle: { color: COLORS.aerob } },
            { value: sumAralash, name: 'Aralash yuklama', itemStyle: { color: COLORS.aralash } },
            { value: sumAnaerob, name: 'Anaerob yuklama', itemStyle: { color: COLORS.anaerob } },
            { value: sumSakrash, name: 'Sakrashlar', itemStyle: { color: COLORS.sakrash } },
          ],
        },
      ],
    };
  });

  readonly quarterlyChartOptions = computed<EChartsOption>(() => {
    const workload = this.data();

    // Create series for each quarter
    const series = QUARTERS.map((quarter, index) => {
      const sumAerob = sumRange(workload.aerob, quarter.start, quarter.end);
      const sumAralash = sumRange(workload.aralash, quarter.start, quarter.end);
      const sumAnaerob = sumRange(workload.anaerob, quarter.start, quarter.end);
      const sumSakrash = sumRange(workload.sakrash, quarter.start, quarter.end);

      // Calculate center position: 17%, 50%, 83%
      const centerX = `${17 + index * 33}%`;

      return {
        name: quarter.name,
        type: 'pie' as const,
        radius: ['25%', '55%'],
        center: [centerX, '55%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold' as const,
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: sumAerob, name: 'Aerob yuklama', itemStyle: { color: COLORS.aerob } },
          { value: sumAralash, name: 'Aralash yuklama', itemStyle: { color: COLORS.aralash } },
          { value: sumAnaerob, name: 'Anaerob yuklama', itemStyle: { color: COLORS.anaerob } },
          { value: sumSakrash, name: 'Sakrashlar', itemStyle: { color: COLORS.sakrash } },
        ],
      };
    });

    return {
      title: QUARTERS.map((quarter, index) => ({
        text: quarter.name,
        left: `${17 + index * 33}%`,
        top: '5%',
        textAlign: 'center' as const,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold' as const,
          color: '#374151',
        },
      })),
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { seriesName: string; name: string; value: number; percent: number };
          return `<strong>${p.seriesName}</strong><br/>${p.name}<br/>Jami: ${p.value.toFixed(1)} km<br/>Ulushi: ${p.percent.toFixed(1)}%`;
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        itemGap: 16,
        textStyle: {
          fontSize: 11,
        },
      },
      series,
    };
  });
}

